const bcrypt = require('bcryptjs');
const { initDb, run, get } = require('./db');

async function seed() {
  console.log('[SEED] Starting database initialization & seeding...');
  await initDb();

  // Allow table creation to finish
  await new Promise((r) => setTimeout(r, 500));

  // Seed Categories
  const categories = [
    { name: 'Computer Science & Software', description: 'Programming, Algorithms, AI, and System Architecture', icon: 'Code' },
    { name: 'Data Science & AI', description: 'Machine Learning, Neural Networks, Big Data', icon: 'Cpu' },
    { name: 'Business & Leadership', description: 'Product Management, Entrepreneurship, Strategy', icon: 'Briefcase' },
    { name: 'Fiction & Literature', description: 'Classic and Modern Literature', icon: 'BookOpen' },
    { name: 'Science & Philosophy', description: 'Physics, Cognitive Science, Epistemology', icon: 'Globe' }
  ];

  for (const cat of categories) {
    const existing = await get('SELECT id FROM categories WHERE name = ?', [cat.name]);
    if (!existing) {
      await run('INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)', [cat.name, cat.description, cat.icon]);
    }
  }

  // Seed Admin Account
  const adminPassword = await bcrypt.hash('admin123', 10);
  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', ['admin@duc.com']);
  let adminId;
  if (!existingAdmin) {
    const res = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin DUC', 'admin@duc.com', adminPassword, 'admin']
    );
    adminId = res.id;
  } else {
    adminId = existingAdmin.id;
  }

  // Seed User Account
  const userPassword = await bcrypt.hash('user123', 10);
  const existingUser = await get('SELECT id FROM users WHERE email = ?', ['user@duc.com']);
  let userId;
  if (!existingUser) {
    const res = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Alex Student', 'user@duc.com', userPassword, 'user']
    );
    userId = res.id;
  } else {
    userId = existingUser.id;
  }

  // Additional User Account
  const existingUser2 = await get('SELECT id FROM users WHERE email = ?', ['sarah@duc.com']);
  let userId2;
  if (!existingUser2) {
    const res = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Sarah Jenkins', 'sarah@duc.com', userPassword, 'user']
    );
    userId2 = res.id;
  } else {
    userId2 = existingUser2.id;
  }

  // Seed Books
  const books = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category_id: 1,
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.',
      cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      digital_content: `CHAPTER 1: Clean Code

There Will Be Code
One might argue that a book about code is a bit retro—that code is no longer the issue; that we should be concerned with models and requirements instead. Indeed, some have suggested that we are close to the end of code.

That code will soon be generated automatically, and programmers will no longer be needed.
This is utter nonsense. We will never be done with code, because code represents the ultimate details of requirements. At some level those details cannot be ignored or abstracted away; they have to be specified. And specifying requirements so precisely that a machine can execute them IS programming.

Meaningful Names
Names are everywhere in software. We name our variables, functions, arguments, classes, and packages. We name our source files and the directories that contain them. We name our jar files and war files and ear files. We name and name and name. Because we do so much of it, we’d better do it well.

Rules for Clean Functions:
1. Small! Functions should be smaller than that.
2. Do One Thing. Functions should do one thing. They should do it well. They should do it only.
3. Use Descriptive Names. Don't be afraid to make a name long. A long descriptive name is better than a short enigmatic name.`,
      copies_total: 4,
      copies_available: 3,
      publisher: 'Prentice Hall',
      publish_year: 2008
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      category_id: 1,
      description: 'Data is at the center of many challenges in system design today. Difficult issues such as scalability, consistency, reliability, efficiency, and maintainability need to be figured out.',
      cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      digital_content: `CHAPTER 1: Reliable, Scalable, and Maintainable Applications

Applications today are data-intensive, as opposed to compute-intensive. Raw CPU power is rarely a bottleneck for these applications—their bigger problems are usually the amount of data, the complexity of data, and the speed at which it is changing.

Thinking About Data Systems
We typically think of databases, queues, caches, etc. as being very different categories of tools. Although a database and a message queue have superficial similarities—both store data for some time—they have very different access patterns, which means different performance characteristics, and thus very different implementations.

Reliability:
The system should continue to work correctly (performing the right function at the desired level of performance) even in the face of adversity (hardware or software faults, and even human error).

Scalability:
The system should have reasonable ways of dealing with growth in data volume, traffic volume, or complexity.`,
      copies_total: 3,
      copies_available: 2,
      publisher: "O'Reilly Media",
      publish_year: 2017
    },
    {
      title: 'Deep Learning with Python',
      author: 'François Chollet',
      isbn: '978-1617294433',
      category_id: 2,
      description: 'Deep learning is an algorithmically driven paradigm shift in artificial intelligence that has enabled groundbreaking advancements in computer vision, natural language processing, and speech recognition.',
      cover_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
      pdf_url: '',
      digital_content: `PART 1: Fundamentals of Deep Learning

What is Artificial Intelligence?
In short, AI is the effort to automate intellectual tasks normally performed by humans. As such, AI is a general field that encompasses machine learning and deep learning, but that also includes many more approaches that don't involve any learning.

Deep learning is a specific subfield of machine learning: a new take on learning representations from data that puts an emphasis on learning successive layers of increasingly meaningful representations.

The "deep" in deep learning isn't a reference to any kind of deeper understanding achieved by the approach; rather, it stands for this idea of successive layers of representations. How many layers contribute to a model of the data is called the depth of the model.`,
      copies_total: 5,
      copies_available: 5,
      publisher: 'Manning Publications',
      publish_year: 2021
    },
    {
      title: 'The Lean Startup',
      author: 'Eric Ries',
      isbn: '978-0307887894',
      category_id: 3,
      description: 'Most startups fail. But many of those failures are preventable. The Lean Startup is a new approach being adopted across the globe, changing the way companies are built and new products are launched.',
      cover_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      pdf_url: '',
      digital_content: `START: Five Principles of Lean Startup

1. Entrepreneurs are everywhere. You don't have to be in a garage to be in a startup.
2. Entrepreneurship is management. A startup is an institution, not just a product, so it requires management tuned to its context.
3. Validated learning. Startups exist not to make stuff, make money, or serve customers. They exist to learn how to build a sustainable business.
4. Build-Measure-Learn. The fundamental activity of a startup is to turn ideas into products, measure how customers respond, and then learn whether to pivot or persevere.
5. Innovation accounting. To improve entrepreneurial outcomes, we need to focus on the boring stuff: how to measure progress, set milestones, and prioritize work.`,
      copies_total: 2,
      copies_available: 1,
      publisher: 'Crown Business',
      publish_year: 2011
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441172719',
      category_id: 4,
      description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.',
      cover_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      pdf_url: '',
      digital_content: `BOOK ONE: DUNE

A beginning is the time for taking the most delicate care that the balances are correct. This is known to every sister of the Bene Gesserit.

In the week before their departure to Arrakis, when all the final scurrying about had reached a nearly unbearable frenzy, an old crone came to visit the mother of the boy, Paul.
It was a warm night at Castle Caladan, and the ancient stone pile that had served the House of Atreides as home for twenty-six generations bore that cooled-down feeling that always foretold a change in the weather.

"I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me."`,
      copies_total: 3,
      copies_available: 2,
      publisher: 'Chilton Books',
      publish_year: 1965
    }
  ];

  for (const bk of books) {
    const existing = await get('SELECT id FROM books WHERE isbn = ?', [bk.isbn]);
    if (!existing) {
      await run(`
        INSERT INTO books (
          title, author, isbn, category_id, description, cover_url, pdf_url, digital_content,
          copies_total, copies_available, publisher, publish_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bk.title, bk.author, bk.isbn, bk.category_id, bk.description, bk.cover_url,
        bk.pdf_url, bk.digital_content, bk.copies_total, bk.copies_available, bk.publisher, bk.publish_year
      ]);
    }
  }

  // Seed Sample Borrowings
  const sampleBorrowings = [
    {
      user_id: userId,
      book_id: 1, // Clean Code
      due_date: '2026-08-14',
      status: 'approved',
      borrow_date: '2026-07-30'
    },
    {
      user_id: userId,
      book_id: 4, // The Lean Startup
      due_date: '2026-08-10',
      status: 'pending',
      borrow_date: '2026-07-31'
    },
    {
      user_id: userId2,
      book_id: 2, // Designing Data-Intensive Applications
      due_date: '2026-08-01',
      status: 'approved',
      borrow_date: '2026-07-18'
    }
  ];

  for (const sb of sampleBorrowings) {
    const existing = await get('SELECT id FROM borrowings WHERE user_id = ? AND book_id = ?', [sb.user_id, sb.book_id]);
    if (!existing) {
      await run(`
        INSERT INTO borrowings (user_id, book_id, due_date, status, borrow_date)
        VALUES (?, ?, ?, ?, ?)
      `, [sb.user_id, sb.book_id, sb.due_date, sb.status, sb.borrow_date]);
    }
  }

  console.log('[SEED] Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('[SEED] Seeding failed:', err);
});
