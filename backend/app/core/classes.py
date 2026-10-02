"""Madarasa rasmi ya madrasa — Maandalizi + Darasa la 1–5 + Viziwi."""
CLASS_ORDER = [
    "Maandalizi",
    "Darasa la 1",
    "Darasa la 2",
    "Darasa la 3",
    "Darasa la 4",
    "Darasa la 5",
    "Viziwi",
]

# Ijumaa: hakuna vipindi (day_of_week index katika committee_timetable_entries)
FRIDAY_DAY_OF_WEEK = 4

def all_classes() -> list[str]:
    return list(CLASS_ORDER)
