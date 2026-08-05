import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import WishlistView from '../views/WishlistView.vue';
import BookDetailView from '../views/BookDetailView.vue';
import ReadBookView from '../views/ReadBookView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import MyBorrowingsView from '../views/MyBorrowingsView.vue';

import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminBooksView from '../views/admin/AdminBooksView.vue';
import AdminBorrowingsView from '../views/admin/AdminBorrowingsView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';

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
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/my-borrowings',
    name: 'my-borrowings',
    component: MyBorrowingsView,
    meta: { requiresAuth: true }
  },
  // Admin Routes
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
    path: '/admin/borrowings',
    name: 'admin-borrowings',
    component: AdminBorrowingsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
