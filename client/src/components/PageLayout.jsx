//আমাদের এখন সব পেজকে ডার্ক মোড ফ্রেন্ডলি করার জন্য একটি কমন র্যাপার তৈরি করতে হবে। প্রতিটি পেজে বারবার কালার ক্লাস না লিখে, আমরা একটি PageLayout কম্পোনেন্ট তৈরি করব।
// client/src/components/PageLayout.jsx
export default function PageLayout({ title, children }) {
  return (
    // লাইট মোডে হোয়াইট/অফ-হোয়াইট আর ডার্ক মোডে পিওর ব্ল্যাক
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}