"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  student_code: string;
  class_name: string;
};

type TeacherRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
};

function pickClass(x: any): string {
  return (
    x.class_name ||
    x.className ||
    x.class ||
    x.student_profile?.class_name ||
    x.profile?.class_name ||
    ""
  )
    .toString()
    .trim();
}

function pickCode(x: any): string {
  return (
    x.student_code ||
    x.studentCode ||
    x.code ||
    x.registration_number ||
    x.student_profile?.student_code ||
    x.profile?.student_code ||
    ""
  )
    .toString()
    .trim();
}

function pickId(x: any): string {
  return (
    x.user_id ||
    x.userId ||
    x.student_user_id ||
    x.id ||
    ""
  ).toString();
}

function pickName(x: any): string {
  return (x.full_name || x.fullName || x.name || "—").toString();
}

function pickEmail(x: any): string {
  return (x.email || "").toString();
}

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function CommitteePasswordPage() {
  const [tab, setTab] = useState<"student" | "teacher" | "self">("student");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selfCurrent, setSelfCurrent] = useState("");
  const [selfNew, setSelfNew] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [debugSample, setDebugSample] = useState("");

  const classes = useMemo(() => allClasses(), []);

  function token() {
    return localStorage.getItem("madrasa_token");
  }

  /** Sawa na ukurasa /committee/students */
  const loadStudents = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token()}` };
    const paths = [
      "/committee/students",
      "/committee/students?class_name=",
      "/committee/students-brief",
    ];
    let rows: any[] = [];
    for (const path of paths) {
      try {
        const res = await fetch(`${API}${path}`, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.students || data.items || data.data || [];
        if (Array.isArray(list) && list.length) {
          rows = list;
          break;
        }
        if (Array.isArray(list)) rows = list;
      } catch {
        /* next */
      }
    }

    if (rows[0]) {
      setDebugSample(JSON.stringify(rows[0]).slice(0, 400));
    }

    const mapped: StudentRow[] = rows.map((x) => ({
      id: pickId(x),
      full_name: pickName(x),
      email: pickEmail(x),
      phone: x.phone ?? null,
      student_code: pickCode(x),
      class_name: pickClass(x),
    })).filter((s) => s.id);

    setStudents(mapped);
    return mapped;
  }, []);

  const loadTeachers = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token()}` };
    const paths = ["/committee/teachers", "/committee/teachers-brief", "/teachers"];
    let rows: any[] = [];
    for (const path of paths) {
      try {
        const res = await fetch(`${API}${path}`, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.teachers || data.items || data.data || [];
        if (Array.isArray(list) && list.length) {
          rows = list;
          break;
        }
      } catch {
        /* next */
      }
    }
    setTeachers(
      rows
        .map((x) => ({
          id: pickId(x),
          full_name: pickName(x),
          email: pickEmail(x),
          phone: x.phone ?? null,
        }))
        .filter((t) => t.id)
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([loadStudents(), loadTeachers()])
      .catch((e) => setError(e?.message || "Imeshindikana kupakia"))
      .finally(() => setLoading(false));
  }, [loadStudents, loadTeachers]);

  const filteredStudents = useMemo(() => {
    const qq = norm(q);
    const cf = norm(classFilter);
    return students.filter((s) => {
      if (cf) {
        const sc = norm(s.class_name);
        if (!sc) return false;
        if (sc !== cf) return false;
      }
      if (!qq) return true;
      return norm(`${s.full_name} ${s.email} ${s.student_code} ${s.class_name}`).includes(qq);
    });
  }, [students, classFilter, q]);

  const filteredTeachers = useMemo(() => {
    const qq = norm(q);
    if (!qq) return teachers;
    return teachers.filter((t) => norm(`${t.full_name} ${t.email}`).includes(qq));
  }, [teachers, q]);

  // Madarasa yaliyopo kwenye data (sio tu CLASS_ORDER)
  // Maandalizi → la 5 tu (hakuna 6/7 hata kama data ya zamani ipo)
  const classOptions = useMemo(() => {
    const allowed = new Set(classes);
    const fromData = Array.from(
      new Set(
        students
          .map((s) => s.class_name)
          .filter((c): c is string => !!c && allowed.has(c))
      )
    );
    // always show official list so filter works even before data loads
    return classes;
  }, [students, classes]);

  async function resetUser(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!selectedId || newPassword.length < 6) {
      setError("Chagua mstari kwenye jedwali na nenosiri (angalau 6)");
      return;
    }
    setBusy(true);
    try {
      let res = await fetch(`${API}/committee/password/set`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: selectedId, new_password: newPassword }),
      });
      if (!res.ok) {
        res = await fetch(`${API}/committee/users/${selectedId}/set-password`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_password: newPassword }),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.detail === "string" ? body.detail : "Imeshindikana");
      }
      setMsg("Nenosiri limewekwa.");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  async function changeSelf(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: selfCurrent,
          new_password: selfNew,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Imeshindikana");
      setMsg("Nenosiri lako limebadilishwa.");
      setSelfCurrent("");
      setSelfNew("");
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia wanafunzi…" />;

  const list = tab === "student" ? filteredStudents : filteredTeachers;
  const selectedStudent = students.find((s) => s.id === selectedId);
  const selectedTeacher = teachers.find((t) => t.id === selectedId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Nenosiri
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Data sawa na ukurasa wa Wanafunzi · bofya mstari → weka nenosiri
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["student", "Wanafunzi"],
            ["teacher", "Walimu"],
            ["self", "Nenosiri langu"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k);
              setSelectedId("");
              setQ("");
              setClassFilter("");
            }}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={
              tab === k
                ? { backgroundColor: colors.primary, color: "#fff" }
                : { backgroundColor: colors.soft, color: colors.primary }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: colors.soft, color: colors.primary }}>
          {msg}
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {tab !== "self" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {tab === "student" && (
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setSelectedId("");
                }}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
              >
                <option value="">Madarasa yote ({students.length})</option>
                {classOptions.map((c) => {
                  const n = students.filter((s) => norm(s.class_name) === norm(c)).length;
                  return (
                    <option key={c} value={c}>
                      {c} ({n})
                    </option>
                  );
                })}
              </select>
            )}
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: colors.stone }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tafuta jina / namba / barua…"
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                style={{ borderColor: colors.line }}
              />
            </div>
            <span className="text-xs" style={{ color: colors.stone }}>
              Inaonekana: {list.length}
            </span>
          </div>

          {/* Ikiwa namba/darasa bado tupu — onesha sample JSON kwa debug */}
          {tab === "student" && students.length > 0 && !students.some((s) => s.class_name) && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Darasa/namba bado tupu kutoka API. Sample: {debugSample || "—"}
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: colors.soft }}>
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2">Jina</th>
                  {tab === "student" && <th className="px-3 py-2">Namba</th>}
                  {tab === "student" && <th className="px-3 py-2">Darasa</th>}
                  <th className="px-3 py-2">Barua pepe</th>
                </tr>
              </thead>
              <tbody>
                {tab === "student" &&
                  filteredStudents.map((u) => (
                    <tr
                      key={u.id}
                      className="cursor-pointer border-t"
                      style={{
                        borderColor: colors.line,
                        backgroundColor: selectedId === u.id ? colors.soft : undefined,
                      }}
                      onClick={() => setSelectedId(u.id)}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          name="pick"
                          checked={selectedId === u.id}
                          onChange={() => setSelectedId(u.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{u.full_name}</td>
                      <td className="px-3 py-2">{u.student_code || "—"}</td>
                      <td className="px-3 py-2">{u.class_name || "—"}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: colors.stone }}>
                        {u.email || "—"}
                      </td>
                    </tr>
                  ))}
                {tab === "teacher" &&
                  filteredTeachers.map((u) => (
                    <tr
                      key={u.id}
                      className="cursor-pointer border-t"
                      style={{
                        borderColor: colors.line,
                        backgroundColor: selectedId === u.id ? colors.soft : undefined,
                      }}
                      onClick={() => setSelectedId(u.id)}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          name="pick"
                          checked={selectedId === u.id}
                          onChange={() => setSelectedId(u.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{u.full_name}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: colors.stone }}>
                        {u.email || "—"}
                      </td>
                    </tr>
                  ))}
                {!list.length && (
                  <tr>
                    <td
                      colSpan={tab === "student" ? 5 : 3}
                      className="px-3 py-8 text-center text-sm"
                      style={{ color: colors.stone }}
                    >
                      Hakuna {tab === "student" ? "mwanafunzi" : "mwalimu"}
                      {classFilter ? ` katika “${classFilter}”` : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={resetUser}
            className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <div className="min-w-[200px] flex-1">
              <p className="text-xs font-medium" style={{ color: colors.stone }}>
                Aliyechaguliwa
              </p>
              <p className="text-sm font-semibold">
                {tab === "student" && selectedStudent
                  ? `${selectedStudent.full_name} · ${selectedStudent.student_code || "—"} · ${selectedStudent.class_name || "—"}`
                  : tab === "teacher" && selectedTeacher
                    ? selectedTeacher.full_name
                    : "— bofya mstari —"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium">Nenosiri jipya</label>
              <input
                type="text"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-48 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !selectedId}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              <KeyRound size={16} />
              Weka nenosiri
            </button>
          </form>
        </>
      )}

      {tab === "self" && (
        <form
          onSubmit={changeSelf}
          className="max-w-md space-y-3 rounded-xl border bg-white p-4"
          style={{ borderColor: colors.line }}
        >
          <div>
            <label className="text-xs font-medium">Nenosiri la sasa</label>
            <input
              type="password"
              required
              value={selfCurrent}
              onChange={(e) => setSelfCurrent(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Nenosiri jipya</label>
            <input
              type="password"
              required
              minLength={6}
              value={selfNew}
              onChange={(e) => setSelfNew(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Badilisha nenosiri langu
          </button>
        </form>
      )}
    </div>
  );
}
