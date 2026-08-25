import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div>
          <h4>Legal Thread BD</h4>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>
            Connecting citizens of Bangladesh with verified lawyers, legal
            knowledge, and secure digital case management.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/lawyers">Find a Lawyer</Link>
          <Link href="/legal-awareness">Legal Knowledge</Link>
          <Link href="/documents">Legal Documents</Link>
          <Link href="/about">About Us</Link>
        </div>
        <div>
          <h4>Practice Areas</h4>
          <Link href="/lawyers?category=criminal">Criminal</Link>
          <Link href="/lawyers?category=civil">Civil</Link>
          <Link href="/lawyers?category=corporate">Corporate</Link>
          <Link href="/lawyers?category=tax">Tax</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/admin/login">Admin Panel</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Legal Thread BD. All rights reserved.
      </div>
    </footer>
  );
}
