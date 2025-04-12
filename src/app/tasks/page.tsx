import TaskManager from '@/components/TaskManager';

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Task Management System</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        This is an example of using MySQL database with Next.js. 
        This application automatically creates a tasks table in your database.
      </p>
      <TaskManager />
    </div>
  );
} 