import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getStudents, deleteStudent } from "../../lib/api";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import AlertDialog from "../../components/AlertDialog.jsx";
import { useAlert } from "../../hooks/useAlert.js";
import { Trash2 } from "lucide-react";

export default function StudentTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { alert, showAlert } = useAlert();

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

  const handleDelete = (id, name) => {
    showAlert({
      title: "Delete Student?",
      message: `Are you sure you want to delete ${name || "this student"}? This action cannot be undone.`,
      variant: "destructive",
      confirmText: "Delete",
      onConfirm: async () => {
        setDeletingId(id);
        const { error: err } = await deleteStudent(id);
        setDeletingId(null);

        if (err) {
          toast.error(err);
          return;
        }

        toast.success("Student deleted successfully");
        setStudents((prev) => prev.filter((s) => s.id !== id));
      },
    });
  };

  if (loading) {
    return <LoadingScreen variant="block" message="Loading students…" />;
  }

  return (
    <div>
      <AlertDialog {...alert} />
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
                  <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
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
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deletingId === s.id}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete ${s.name || "student"}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
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
