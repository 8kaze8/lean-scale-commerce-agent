import { ChatLayout } from "@/components/chat-layout";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-lg shadow-2xl rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 h-full sm:h-auto">
        <ChatLayout />
      </div>
    </main>
  );
}
