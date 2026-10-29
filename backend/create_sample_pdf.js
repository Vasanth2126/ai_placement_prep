const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateSampleResume() {
  const doc = new PDFDocument({ margin: 40, compress: false });
  const outputPath = path.join(__dirname, '..', 'sample_placement_resume.pdf');
  const writeStream = fs.createWriteStream(outputPath);

  doc.pipe(writeStream);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('ALEX R. CHEN', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(
    'Full Stack Software Engineer | alex.chen@example.com | +1 (555) 019-2834 | github.com/alexchen | linkedin.com/in/alexchen',
    { align: 'center' }
  );
  doc.moveDown(1);

  // Education
  doc.fontSize(13).font('Helvetica-Bold').text('EDUCATION');
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica-Bold').text('Bachelor of Technology in Computer Science and Engineering', { continued: true });
  doc.font('Helvetica').text(' — GPA: 3.85 / 4.0 (2022 - 2026)');
  doc.moveDown(1);

  // Technical Skills
  doc.fontSize(13).font('Helvetica-Bold').text('TECHNICAL SKILLS');
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica-Bold').text('Programming Languages: ', { continued: true });
  doc.font('Helvetica').text('JavaScript, TypeScript, Python, C++, Java, SQL, C, HTML5, CSS3');

  doc.font('Helvetica-Bold').text('Frameworks & Libraries: ', { continued: true });
  doc.font('Helvetica').text('React, Node.js, Express.js, Next.js, Spring Boot, Tailwind CSS, Redux');

  doc.font('Helvetica-Bold').text('Databases & Caching: ', { continued: true });
  doc.font('Helvetica').text('MongoDB, PostgreSQL, MySQL, Redis, DynamoDB');

  doc.font('Helvetica-Bold').text('Tools & Cloud: ', { continued: true });
  doc.font('Helvetica').text('Docker, Kubernetes, AWS, Git, GitHub Actions, CI/CD Pipelines, Linux, Postman');

  doc.font('Helvetica-Bold').text('Core CS Concepts: ', { continued: true });
  doc.font('Helvetica').text('Data Structures, Algorithms, System Design, RESTful APIs, Microservices Architecture, OOP');
  doc.moveDown(1);

  // Projects
  doc.fontSize(13).font('Helvetica-Bold').text('PROJECTS');
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);

  // Project 1
  doc.fontSize(11).font('Helvetica-Bold').text('1. Scalable E-Commerce Microservices Platform');
  doc.fontSize(9.5).font('Helvetica-Oblique').text('Tech Stack: Node.js, Express.js, React, MongoDB, Redis, Docker, AWS');
  doc.font('Helvetica').fontSize(9.5).text('• Architected high-throughput microservices capable of processing 5,000+ checkout orders/min with Redis distributed locks.');
  doc.font('Helvetica').fontSize(9.5).text('• Deployed containerized services on Docker and AWS with automated CI/CD pipelines and JWT authentication.');
  doc.moveDown(0.8);

  // Project 2
  doc.fontSize(11).font('Helvetica-Bold').text('2. Real-Time Collaborative Document Editor');
  doc.fontSize(9.5).font('Helvetica-Oblique').text('Tech Stack: TypeScript, React, Node.js, PostgreSQL, WebSockets, Docker');
  doc.font('Helvetica').fontSize(9.5).text('• Engineered real-time document synchronization via WebSockets and Operational Transformation with sub-50ms latency.');
  doc.font('Helvetica').fontSize(9.5).text('• Optimized database queries and composite indexing on PostgreSQL, reducing read query latency by 45%.');
  doc.moveDown(0.8);

  // Project 3
  doc.fontSize(11).font('Helvetica-Bold').text('3. Distributed URL Shortener & High-QPS Analytics Engine');
  doc.fontSize(9.5).font('Helvetica-Oblique').text('Tech Stack: Python, FastAPI, Redis, PostgreSQL, Docker, Nginx');
  doc.font('Helvetica').fontSize(9.5).text('• Designed high-availability URL shortener leveraging Base62 encoding and Redis LRU caching for 10M+ daily hits.');
  doc.font('Helvetica').fontSize(9.5).text('• Configured Nginx reverse proxy with Token Bucket rate limiters to mitigate DDoS attacks and protect API capacity.');

  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ Generated authentic ATS-optimized PDF resume at:', outputPath);
  });
}

generateSampleResume();
