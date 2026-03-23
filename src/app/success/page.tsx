export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <span className="text-green-400 text-3xl">&#10003;</span>
      </div>
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-[var(--muted)] mb-8">
        Your subscription is now active. Your credits have been added to your
        account. Start converting videos right away!
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/convert"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          Convert a Video
        </a>
        <a
          href="/my-scripts"
          className="border border-[var(--border)] hover:border-[var(--muted)] px-6 py-3 rounded-lg transition"
        >
          My Scripts
        </a>
      </div>
    </div>
  );
}
