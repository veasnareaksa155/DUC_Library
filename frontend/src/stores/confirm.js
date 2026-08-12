import { defineStore } from 'pinia';

export const useConfirmStore = defineStore('confirm', {
  state: () => ({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger', 'warning', 'info'
    resolvePromise: null,
  }),
  actions: {
    showConfirm(options) {
      this.title = options.title || 'Confirm';
      this.message = options.message || 'Are you sure you want to proceed?';
      this.confirmText = options.confirmText || 'Confirm';
      this.cancelText = options.cancelText || 'Cancel';
      this.type = options.type || 'danger';
      this.isOpen = true;
      
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },
    confirm() {
      this.isOpen = false;
      if (this.resolvePromise) {
        this.resolvePromise(true);
        this.resolvePromise = null;
      }
    },
    cancel() {
      this.isOpen = false;
      if (this.resolvePromise) {
        this.resolvePromise(false);
        this.resolvePromise = null;
      }
    }
  }
});
