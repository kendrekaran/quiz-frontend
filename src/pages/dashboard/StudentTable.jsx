import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getStudents } from "../../lib/api";
import LoadingScreen from "../../components/LoadingScreen.jsx";

export default function StudentTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { students: list, error: err } = await getStudents();
      if (cancelled) return;
      setStudents(list ?? []);
      setError(err ?? null);
      if (err) toast.error(err);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <LoadingScreen variant="block" message="Loading students…" />;
  }

  return (
    <div>
      <h1 className="display-font text-2xl text-foreground md:text-3xl">
        Student Table
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        View and manage all students you have added.
      </p>

      <div className="mt-8 overflow-hidden rounded-sm border border-border bg-card">
        {error && (
          <div className="border-b border-border bg-muted px-6 py-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {students.length === 0 && !error ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No students yet. Add students from <strong>Create Student</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Number</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Class</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Div</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Roll No.</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border transition-colors hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 text-foreground">{s.name ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{s.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.number ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.class ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.div ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.roll_number ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
