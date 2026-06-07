/**
 * Admin Kullanıcı Kurulum Scripti
 *
 * Bu script Firebase Console'da veya Firebase Admin SDK ile
 * admin kullanıcı oluşturmak için kullanılabilir.
 *
 * Adımlar:
 *
 * 1. Firebase Console'da Authentication > Users bölümünden
 *    bir kullanıcı oluşturun (örn: admin@velado.com)
 *
 * 2. Firebase Console'da Firestore Database bölümüne gidin
 *
 * 3. "admins" collection'ı oluşturun
 *
 * 4. Yeni bir document ekleyin:
 *    - Document ID: (kullanıcının UID'si - Authentication'dan kopyalayın)
 *    - Fields:
 *      - email: string (admin@velado.com)
 *      - isAdmin: boolean (true)
 *      - createdAt: timestamp (now)
 *
 * Örnek document yapısı:
 *
 * admins/
 *   └── {USER_UID}/
 *       ├── email: "admin@velado.com"
 *       ├── isAdmin: true
 *       └── createdAt: 2024-01-01T00:00:00Z
 *
 *
 * Alternatif: Firebase Admin SDK ile programatik kurulum
 * (Node.js ortamında çalıştırılmalı)
 *
 * const admin = require('firebase-admin');
 *
 * admin.initializeApp({
 *   credential: admin.credential.applicationDefault()
 * });
 *
 * async function setupAdmin(email, password) {
 *   // Create user
 *   const user = await admin.auth().createUser({
 *     email,
 *     password,
 *     displayName: 'Admin'
 *   });
 *
 *   // Add to admins collection
 *   await admin.firestore().collection('admins').doc(user.uid).set({
 *     email,
 *     isAdmin: true,
 *     createdAt: admin.firestore.FieldValue.serverTimestamp()
 *   });
 *
 *   console.log('Admin created:', user.uid);
 * }
 *
 * setupAdmin('admin@velado.com', 'secure-password-here');
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  VELADO Admin Kurulum                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Admin kullanıcı oluşturmak için:                           ║
║                                                              ║
║  1. Firebase Console > Authentication > Users               ║
║     - "Add user" ile yeni kullanıcı oluşturun               ║
║     - Email: admin@velado.com                               ║
║     - Password: güçlü bir şifre                             ║
║                                                              ║
║  2. Kullanıcının UID'sini kopyalayın                        ║
║                                                              ║
║  3. Firebase Console > Firestore Database                   ║
║     - "admins" collection oluşturun                         ║
║     - Yeni document ekleyin (ID: kopyaladığınız UID)        ║
║     - Field ekleyin: isAdmin (boolean) = true              ║
║                                                              ║
║  4. http://localhost:3000/admin/giris adresinden            ║
║     oluşturduğunuz bilgilerle giriş yapın                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
