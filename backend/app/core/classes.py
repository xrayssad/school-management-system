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

# Siku 6 za shule (J.1–J.6): 0,1,2,3,5,6 — si Ijumaa (4)
SCHOOL_DAY_OF_WEEK = (0, 1, 2, 3, 5, 6)
J_DAY_LABELS = {0: "J.1", 1: "J.2", 2: "J.3", 3: "J.4", 5: "J.5", 6: "J.6"}


def all_classes() -> list[str]:
    return list(CLASS_ORDER)
