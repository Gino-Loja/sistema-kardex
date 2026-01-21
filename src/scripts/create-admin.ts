// Tu conexión de Drizzle

import "dotenv/config";

import { db } from "@/lib/drizzle/db";
import { auth } from "@/lib/auth/auth";



async function main() {
    console.log("🚀 Creando usuario administrador...");

    // testeamos la conexión
    const result = await db.execute('select 1');
    if (!result.rows || result.rows.length === 0) {
        console.log("❌ No se pudo conectar a la base de datos");
        process.exit(1);
    }

    console.log("✅ Conexión a la base de datos exitosa");



    // Better-Auth valida si el email ya existe, así que es seguro correrlo
    try {
        const adminEmail = "garyramos442@gmail.com";



        // Usamos la API interna de better-auth para registrar
        // Esto crea el User Y el Account automáticamente con el hash correcto
        const newUser = await auth.api.createUser({
            body: {
                email: adminEmail, // required
                password: "Gary25.!", // required
                name: "Administrador", // required
                role: "admin", // required
                // data: { customField: "customValue" },
            },
        });

        // Opcional: Si necesitas forzar el rol manualmente porque no lo pasaste arriba
        // y tu tabla users tiene una columna 'role':
        /*
        if (res.user) {
           await db.update(users)
             .set({ role: 'admin' })
             .where(eq(users.id, res.user.id));
        }
        */

        console.log("✅ Admin creado exitosamente");
    } catch (error) {
        // Si el usuario ya existe, Better-Auth lanzará un error, lo cual es bueno
        console.log("⚠️ El admin ya existía o hubo un error:", error);
    } finally {
        process.exit(0);
    }
}

main();