import { useState } from "react";
import { toast } from "sonner";
import { createStudent as createStudentApi } from "../../lib/api";
import LoadingScreen from "../../components/LoadingScreen.jsx";

const DEFAULT_FORM = {
  name: "",
  email: "",
  number: "",
  class: "",
  div: "",
  roll_number: "",
};

export default function CreateStudent() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.email?.trim()) {
      setError("Email is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { student, error: err } = await createStudentApi({
      name: form.name.trim(),
      email: form.email.trim(),
      number: form.number?.trim() || null,
      class: form.class?.trim() || null,
      div: form.div?.trim() || null,
      roll_number: form.roll_number?.trim() || null,
    });
    setSubmitting(false);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setSuccess(true);
    setForm(DEFAULT_FORM);
  }

  if (submitting) {
    return <LoadingScreen variant="block" message="Creating student…" />;
  }

  return (
    <div>
      <h1 className="display-font text-2xl text-foreground md:text-3xl">
        Create Student
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a new student with name, email, phone, class, division, and roll number.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Name <span className="text-primary">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Email (Gmail) <span className="text-primary">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="student@gmail.com"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              required
            />
          </div>

          <div>
            <label htmlFor="number" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            <input
              id="number"
              type="tel"
              value={form.number}
              onChange={(e) => handleChange("number", e.target.value)}
              placeholder="10-digit number"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="class" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Class
            </label>
            <input
              id="class"
              type="text"
              value={form.class}
              onChange={(e) => handleChange("class", e.target.value)}
              placeholder="e.g. 10, 12"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="div" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Division
            </label>
            <input
              id="div"
              type="text"
              value={form.div}
              onChange={(e) => handleChange("div", e.target.value)}
              placeholder="e.g. A, B"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label htmlFor="roll_number" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Roll Number
            </label>
            <input
              id="roll_number"
              type="text"
              value={form.roll_number}
              onChange={(e) => handleChange("roll_number", e.target.value)}
              placeholder="e.g. 1, 42"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              Create Student
            </button>
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-chart-2" role="status">
                Student created successfully.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
