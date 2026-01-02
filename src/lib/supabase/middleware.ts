import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  // --- START: FORCE PASSWORD CHANGE LOGIC ---
  // This block runs if a user is logged in.
  if (
    user &&
    pathname !== "/change-password" &&
    !pathname.startsWith("/login")
  ) {
    // Check our custom flag in the database.
    const { data: studentProfile, error } = await supabase
      .from("students") // Or 'profiles' if you named it that
      .select("password_change_required")
      .eq("id", user.id)
      .single();

    // If the flag is true, force redirect to the change-password page.
    if (studentProfile?.password_change_required) {
      // Use rewrite to show the change-password page content
      // without changing the URL in the browser bar.
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.rewrite(url);
    }

    if (error) {
      console.error("Middleware error checking password flag:", error.message);
      // If we can't check the profile, let them proceed but log the error.
      // You could also choose to redirect them to an error page.
    }
  }
  // --- END: FORCE PASSWORD CHANGE LOGIC ---

  // This is your existing logic to protect routes from unauthenticated users.
  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/landing") &&
    !pathname.startsWith("/application") &&
    !pathname.startsWith("/book-demo") &&
    !pathname.startsWith("/gallery") &&
    pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
