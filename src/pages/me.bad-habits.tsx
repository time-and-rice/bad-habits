import { Link } from "react-router-dom";

export default function BadHabits() {
  return (
    <div>
      <h1 className="text-center">Bad Habits</h1>

      <div className="flex flex-col space-y-4">
        <Link to="new" className="app-link self-end">
          New
        </Link>

        <div>List</div>
      </div>
    </div>
  );
}
