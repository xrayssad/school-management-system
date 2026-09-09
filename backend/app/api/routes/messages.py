from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.communication import Message
from app.models.user import User
from app.schemas.communication import MessageOut, MessageCreate

router = APIRouter(prefix="/messages", tags=["messages"])


def _serialize(m: Message, db: Session) -> dict:
    sender = db.get(User, m.sender_id)
    recipient = db.get(User, m.recipient_id)
    return {
        "id": m.id,
        "sender_id": m.sender_id,
        "sender_name": sender.full_name if sender else None,
        "recipient_id": m.recipient_id,
        "recipient_name": recipient.full_name if recipient else None,
        "subject": m.subject,
        "body": m.body,
        "is_read": m.is_read,
        "sent_at": m.sent_at,
    }


@router.get("/inbox", response_model=list[MessageOut])
def inbox(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msgs = db.query(Message).filter(Message.recipient_id == current_user.id).order_by(Message.sent_at.desc()).all()
    return [_serialize(m, db) for m in msgs]


@router.get("/sent", response_model=list[MessageOut])
def sent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msgs = db.query(Message).filter(Message.sender_id == current_user.id).order_by(Message.sent_at.desc()).all()
    return [_serialize(m, db) for m in msgs]


@router.post("", response_model=MessageOut)
def send_message(payload: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recipient = db.get(User, payload.recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    m = Message(sender_id=current_user.id, recipient_id=payload.recipient_id, subject=payload.subject, body=payload.body)
    db.add(m)
    db.commit()
    db.refresh(m)
    return _serialize(m, db)


@router.put("/{message_id}/read", response_model=MessageOut)
def mark_read(message_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    m = db.get(Message, message_id)
    if not m or m.recipient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Message not found")
    m.is_read = True
    db.commit()
    db.refresh(m)
    return _serialize(m, db)


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Message).filter(Message.recipient_id == current_user.id, Message.is_read == False).count()  # noqa: E712
    return {"count": count}
