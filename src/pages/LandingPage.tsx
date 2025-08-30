import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { GraduationCap, Search, ListChecks, BookOpen } from 'lucide-react';

function Card({ title, description, to, icon }: { title: string; description: string; to: string; icon: ReactNode }) {
  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-gray-800"
    >
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300">
        {/* Placeholder icon; will swap to lucide-react once installed */}
        <div className="w-20 h-20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Welcome to Xhosa Kapital</h1>
        <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-3xl">
          Master isiXhosa by taking control of the means of production of language: sound, form, and meaning. Our tools help you
          accumulate linguistic capital through practice, concept clarity, and real texts—without mystifying jargon. Pick a path below.
        </p>
      </header>

      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Course"
            description="Build your base of linguistic capital step by step: dialogues as the factory floor, grammar as the machinery, and practice as your daily labor that produces real skill."
            to="/course"
            icon={<GraduationCap className="w-12 h-12" />}
          />
          <Card
            title="Dictionary"
            description="Seize the means of meaning-making. Quickly locate words, examples, and forms so you can command vocabulary like a well-organized collective."
            to="/dictionary"
            icon={<Search className="w-12 h-12" />}
          />
          <Card
            title="Vocab Practice"
            description="Transform passive knowledge into productive power. Drills convert time and effort into durable vocabulary—your linguistic surplus value."
            to="/vocab"
            icon={<ListChecks className="w-12 h-12" />}
          />
          <Card
            title="Texts"
            description="Read authentic texts—the real marketplace where language circulates. See how structures work in the wild and bring them back into your own production."
            to="/texts"
            icon={<BookOpen className="w-12 h-12" />}
          />
        </div>
      </section>
    </div>
  );
}
