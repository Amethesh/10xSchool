"use client";

import React from "react";
import Image from "next/image";
import { UserPlus, GraduationCap, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

export type AdminNavKey = "dashboard" | "requests";

type AdminTopBarProps = {
  /** Marks the current page in the nav. */
  active?: AdminNavKey;
};

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard" },
  { key: "requests", label: "Access requests", href: "/admin/access-requests" },
] as const;

/**
 * One horizontal bar instead of a rail: with only four destinations, a full
 * sidebar spent a lot of width on very little navigation.
 */
const AdminTopBar = ({ active = "dashboard" }: AdminTopBarProps) => (
  <header className="flex items-center gap-x-5 gap-y-3 flex-wrap mb-6">
    <a href="/admin/dashboard" className="flex items-center gap-2.5 shrink-0">
      <Image
        src="/images/10x_small.png"
        alt=""
        width={38}
        height={38}
        className="object-contain"
      />
      <span className="text-base font-bold tracking-tight text-[#0246A4]">
        THE 10X SCHOOL
      </span>
    </a>

    <nav className="flex items-center gap-1">
      {NAV.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          className={`ac-navpill${active === key ? " is-active" : ""}`}
        >
          {label}
        </a>
      ))}
    </nav>

    <div className="flex items-center gap-2 ml-auto">
      <a href="/admin/create-student" className="ac-btn ac-btn-primary">
        <UserPlus className="w-4 h-4" />
        New student
      </a>
      <a href="/admin/create-teacher" className="ac-btn">
        <GraduationCap className="w-4 h-4" />
        New teacher
      </a>
      <form action={logout}>
        <button type="submit" className="ac-icon-btn" title="Log out">
          <LogOut className="w-4 h-4" />
        </button>
      </form>
    </div>
  </header>
);

export default AdminTopBar;
