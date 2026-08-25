import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import WishlistView from '../views/WishlistView.vue';
import BookDetailView from '../views/BookDetailView.vue';
import ReadBookView from '../views/ReadBookView.vue';
import LoginView from '../views/LoginView.vue';

import MyBorrowingsView from '../views/MyBorrowingsView.vue';
import ProfileView from '../views/ProfileView.vue';

import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminBooksView from '../views/admin/AdminBooksView.vue';
import AdminBorrowingsView from '../views/admin/AdminBorrowingsView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import AdminProfileView from '../views/admin/AdminProfileView.vue';
import AdminLoginView from '../views/admin/AdminLoginView.vue';
import AdminCategoriesView from '../views/admin/AdminCategoriesView.vue';
import AdminCheckinsView from '../views/admin/AdminCheckinsView.vue';
import AdminDigitalReadsView from '../views/admin/AdminDigitalReadsView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: CatalogView
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistView
  },
  {
    path: '/book/:id',
    name: 'book-detail',
    component: BookDetailView
  },
  {
    path: '/read/:id',
    name: 'read-book',
    component: ReadBookView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },

  {
    path: '/my-borrowings',
    name: 'my-borrowings',
    component: MyBorrowingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  // Admin Routes
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginView
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/books',
    name: 'admin-books',
    component: AdminBooksView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: AdminCategoriesView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/borrowings',
    name: 'admin-borrowings',
    component: AdminBorrowingsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/checkins',
    name: 'admin-checkins',
    component: AdminCheckinsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/digital-reads',
    name: 'admin-digital-reads',
    component: AdminDigitalReadsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/profile',
    name: 'admin-profile',
    component: AdminProfileView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Set context based on route
  const isTargetAdmin = to.path.startsWith('/admin');
  authStore.setContext(isTargetAdmin ? 'admin' : 'user');

  if (to.meta.requiresAuth && !authStore.isUserAuthenticated && !isTargetAdmin) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !authStore.isAdminAuthenticated) {
    return next({ name: 'admin-login', query: { redirect: to.fullPath } });
  }

  // Prevent authenticated admins from going to user login, and users to admin login
  if (to.name === 'admin-login' && authStore.isAdminAuthenticated) {
    return next({ name: 'admin-dashboard' });
  }
  if (to.name === 'login' && authStore.isUserAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
