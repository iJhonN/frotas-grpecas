import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Obtém o usuário ativo autenticado a partir dos cookies
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Define as rotas públicas que não exigem login (Login e recortes de autenticação)
    const isPublicRoute =
        pathname === "/login" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/termos-lgpd")

    // 1. Bloqueio de Acesso: Se NÃO estiver logado e tentar acessar rota privada -> Redireciona para /login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // 2. Se JÁ ESTIVER logado e tentar acessar a página de /login -> Redireciona para o /dashboard
    if (user && pathname === "/login") {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}