export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white px-5 py-10 text-black sm:px-8">
      <div className="mx-auto flex max-w-7xl justify-center">
        <p className="text-base font-semibold tracking-wide sm:text-lg">
          &copy; {year} SEΛN X KΛLO
        </p>
      </div>
    </footer>
  );
}
