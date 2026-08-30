import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLocaleStore } from './locale';

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false);
  const message = ref('');
  const title = ref('');
  const type = ref('success'); // 'success' | 'wishlist-add' | 'wishlist-remove' | 'info' | 'error'
  let timer = null;

  function translateToast(t, m) {
    const localeStore = useLocaleStore();
    if (localeStore.currentLang !== 'km') return { title: t, message: m };

    let translatedTitle = t;
    let translatedMessage = m;

    // Titles
    if (t === 'Success!') translatedTitle = 'ជោគជ័យ!';
    else if (t === 'Error') translatedTitle = 'មានកំហុស';
    else if (t === 'Action Complete') translatedTitle = 'សកម្មភាពបានបញ្ចប់';
    else if (t === 'Saved to Collection') translatedTitle = 'បានរក្សាទុកទៅក្នុងបណ្ដុំរបស់អ្នក';
    else if (t === 'Removed from Collection') translatedTitle = 'បានលុបចេញពីបណ្ដុំរបស់អ្នក';
    else if (t === 'Security Alert') translatedTitle = 'បម្រាមសុវត្ថិភាព';
    else if (t === 'New Request Alert') translatedTitle = 'ការជូនដំណឹងពីសំណើសុំថ្មី';
    else if (t === 'Check-In Alert') translatedTitle = 'ការជូនដំណឹងពីការចុះឈ្មោះចូល';
    else if (t === 'Live Reading Alert') translatedTitle = 'ការជូនដំណឹងពីការអានបន្តផ្ទាល់';
    else if (t === 'Authentication Required') translatedTitle = 'តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវ';
    else if (t === 'Request Sent') translatedTitle = 'សំណើត្រូវបានផ្ញើ';
    else if (t === 'Request Approved! 🎉') translatedTitle = 'សំណើត្រូវបានអនុម័ត! 🎉';
    else if (t === 'Request Declined') translatedTitle = 'សំណើត្រូវបានបដិសេធ';
    else if (t === 'Book Returned') translatedTitle = 'ការសងសៀវភៅ';
    else if (t === 'Update') translatedTitle = 'បច្ចុប្បន្នភាព';
    else if (t === 'Action Denied') translatedTitle = 'សកម្មភាពត្រូវបានបដិសេធ';

    // Messages
    if (m === 'Category updated successfully') translatedMessage = 'ប្រភេទសៀវភៅត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ';
    else if (m === 'Category created successfully') translatedMessage = 'ប្រភេទសៀវភៅត្រូវបានបង្កើតដោយជោគជ័យ';
    else if (m === 'Category deleted successfully') translatedMessage = 'ប្រភេទសៀវភៅត្រូវបានលុបដោយជោគជ័យ';
    else if (m === '2FA was enabled on another device.') translatedMessage = 'ការផ្ទៀងផ្ទាត់ 2 ជំហាន (2FA) ត្រូវបានបើកនៅលើឧបករណ៍ផ្សេងទៀត។';
    else if (m === '2FA was disabled on another device.') translatedMessage = 'ការផ្ទៀងផ្ទាត់ 2 ជំហាន (2FA) ត្រូវបានបិទនៅលើឧបករណ៍ផ្សេងទៀត។';
    else if (m === 'Login is required to add to wishlist!') translatedMessage = 'តម្រូវឱ្យចូលគណនីដើម្បីបន្ថែមទៅបញ្ជីប្រាថ្នា!';
    else if (m === 'Borrow request submitted successfully. Awaiting admin approval.') translatedMessage = 'សំណើសុំខ្ចីត្រូវបានបញ្ជូនដោយជោគជ័យ។ រង់ចាំការអនុម័តពីអ្នកគ្រប់គ្រង។';
    else if (m === 'You already have a book currently borrowed. Please return your active book before borrowing another.') translatedMessage = 'អ្នកកំពុងខ្ចីសៀវភៅមួយក្បាលហើយ។ សូមសងសៀវភៅរបស់អ្នកសិន មុននឹងខ្ចីសៀវភៅមួយទៀត។';
    else if (m === 'You already have a pending borrow request for a book. Please wait for it to be processed or return it first.') translatedMessage = 'អ្នកមានសំណើសុំខ្ចីសៀវភៅដែលកំពុងរង់ចាំការអនុម័ត។ សូមរង់ចាំ ឬសងសៀវភៅសិន។';
    else if (m === 'This book is currently out of stock.') translatedMessage = 'សៀវភៅនេះអស់ពីស្តុកហើយនៅពេលនេះ។';
    else if (m === 'Book not found.') translatedMessage = 'រកមិនឃើញសៀវភៅទេ។';
    else if (m.startsWith('Your request for "') && m.endsWith('" was approved.')) {
      const title = m.match(/Your request for "(.*?)" was approved\./)?.[1] || '';
      translatedMessage = `សំណើសុំសៀវភៅ "${title}" របស់អ្នកត្រូវបានអនុម័ត។`;
    }
    else if (m.startsWith('Your request for "') && m.endsWith('" was declined.')) {
      const title = m.match(/Your request for "(.*?)" was declined\./)?.[1] || '';
      translatedMessage = `សំណើសុំសៀវភៅ "${title}" របស់អ្នកត្រូវបានបដិសេធ។`;
    }
    else if (m.startsWith('"') && m.endsWith('" has been successfully returned.')) {
      const title = m.match(/"(.*?)" has been successfully returned\./)?.[1] || '';
      translatedMessage = `សៀវភៅ "${title}" ត្រូវបានសងដោយជោគជ័យ។`;
    }
    else if (m.startsWith('Status for "') && m.includes('" changed to ')) {
      const match = m.match(/Status for "(.*?)" changed to (.*?)\./);
      if (match) translatedMessage = `ស្ថានភាពសម្រាប់សៀវភៅ "${match[1]}" ត្រូវបានប្តូរទៅជា ${match[2]}។`;
    }
    else if (m.startsWith('A new login was detected on your account from ')) {
      const match = m.match(/from (.*?) in (.*?)\./);
      if (match) translatedMessage = `ការចូលប្រើប្រាស់ថ្មីត្រូវបានរកឃើញនៅលើគណនីរបស់អ្នកពី ${match[1]} នៅ ${match[2]}។`;
    }
    else if (m.startsWith('New book request for "')) {
      const title = m.match(/for "(.*?)"/)?.[1] || '';
      translatedMessage = `សំណើសុំសៀវភៅថ្មីសម្រាប់ "${title}"`;
    }
    else if (m.startsWith('New check-in from ')) {
      const user = m.replace('New check-in from ', '');
      translatedMessage = `ការចុះឈ្មោះចូលថ្មីពី ${user}`;
    }
    else if (m.startsWith('Student ') && m.includes(' started reading "')) {
      const match = m.match(/Student (.*?) started reading "(.*?)"/);
      if (match) translatedMessage = `សិស្ស ${match[1]} បានចាប់ផ្តើមអាន "${match[2]}"`;
    }
    else if (m.endsWith('" has been saved to your collection.')) {
      const title = m.match(/"(.*?)"/)?.[1] || '';
      translatedMessage = `"${title}" ត្រូវបានរក្សាទុកទៅក្នុងបណ្ដុំរបស់អ្នក។`;
    }
    else if (m.endsWith('" was removed from your collection.')) {
      const title = m.match(/"(.*?)"/)?.[1] || '';
      translatedMessage = `"${title}" ត្រូវបានលុបចេញពីបណ្ដុំរបស់អ្នក។`;
    }

    return { title: translatedTitle, message: translatedMessage };
  }

  function show(msg, options = {}) {
    if (timer) clearTimeout(timer);
    let t = options.title || (options.type === 'error' ? 'Error' : 'Success!');
    const translated = translateToast(t, msg);
    
    message.value = translated.message;
    type.value = options.type || 'success';
    title.value = translated.title;
    isVisible.value = true;

    timer = setTimeout(() => {
      isVisible.value = false;
    }, options.duration || 3200);
  }

  function showWishlist(bookTitle, isAdded) {
    show(
      isAdded 
        ? `"${bookTitle}" has been saved to your collection.` 
        : `"${bookTitle}" was removed from your collection.`,
      {
        title: isAdded ? 'Saved to Collection' : 'Removed from Collection',
        type: isAdded ? 'wishlist-add' : 'wishlist-remove',
        duration: 3000
      }
    );
  }

  function showSuccess(msg, customTitle = 'Action Complete') {
    show(msg, { title: customTitle, type: 'success', duration: 3000 });
  }

  function showError(msg, customTitle = 'Error') {
    show(msg, { title: customTitle, type: 'error', duration: 4000 });
  }

  function hide() {
    isVisible.value = false;
    if (timer) clearTimeout(timer);
  }

  return {
    isVisible,
    message,
    title,
    type,
    show,
    showWishlist,
    showSuccess,
    showError,
    hide
  };
});
