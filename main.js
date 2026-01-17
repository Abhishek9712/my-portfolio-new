import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Component Loading System ---
    async function loadComponents() {
        try {
            const headerResponse = await fetch('components/header.html');
            const footerResponse = await fetch('components/footer.html');

            if (headerResponse.ok) {
                const headerHtml = await headerResponse.text();
                document.getElementById('header-placeholder').innerHTML = headerHtml;
                // Init Header JS logic
                initHeader();
            } else {
                console.error("Failed to load header");
            }

            if (footerResponse.ok) {
                const footerHtml = await footerResponse.text();
                document.getElementById('footer-placeholder').innerHTML = footerHtml;
                // Init Footer JS logic
                initFooter();
            } else {
                console.error("Failed to load footer");
            }

            // After DOM injection, initialize the interactive parts
            initApp();
        } catch (error) {
            console.error("Error loading components:", error);
            // Even if fetch fails (e.g. CORS on local file://), try to init rest of app
            initApp();
        }
    }

    // Call the loader
    loadComponents();


    function initApp() {
        console.log("Initializing App Interactions...");

        // --- Terminal Typewriter Effect ---
        const terminalText = [
            "> Initializing environment...",
            "> Loading modules: Design, DevOps, CI/CD...",
            "> [SUCCESS] Pipeline Active.",
            "> Welcome."
        ];

        const terminalElement = document.getElementById('terminal-typewriter');
        // Check if element exists (might safeguard against missing DOM)
        if (terminalElement) {
            let lineIndex = 0;
            let charIndex = 0;

            function typeWriter() {
                if (lineIndex < terminalText.length) {
                    if (charIndex < terminalText[lineIndex].length) {
                        let currentLine = terminalElement.children[lineIndex];
                        if (!currentLine) {
                            currentLine = document.createElement('div');
                            terminalElement.appendChild(currentLine);
                        }
                        currentLine.textContent += terminalText[lineIndex].charAt(charIndex);
                        charIndex++;
                        setTimeout(typeWriter, 30);
                    } else {
                        // Move to next line
                        lineIndex++;
                        charIndex = 0;
                        setTimeout(typeWriter, 400);
                    }
                }
                // Stop after finishing all lines (no loop/delete)
            }
            typeWriter();
        }

        // --- Custom Cursor Logic (Optimized) ---
        const cursor = document.getElementById('custom-cursor');
        const hoverTargets = document.querySelectorAll('a, button, .hover-trigger, [data-cursor]');

        if (cursor) {
            document.addEventListener('mousemove', (e) => {
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            });

            // Re-bind hover listeners to ALL targets (including newly injected ones)
            // We select them again to be sure we catch the injected header/footer elements
            const allTargets = document.querySelectorAll('a, button, .hover-trigger, [data-cursor]');

            allTargets.forEach(target => {
                target.addEventListener('mouseenter', () => {
                    cursor.classList.add('scale-150'); // visual feedback through class if needed, or JS styles below
                    document.body.classList.add('hovering');

                    const cursorType = target.getAttribute('data-cursor');
                    if (cursorType === 'code') {
                        document.body.classList.add('hovering-code');
                    } else if (cursorType === 'link') {
                        document.body.classList.add('hovering-link');
                    }
                });

                target.addEventListener('mouseleave', () => {
                    cursor.classList.remove('scale-150');
                    document.body.classList.remove('hovering', 'hovering-code', 'hovering-link');
                });
            });
        }


        // --- Scroll Reveal Animation ---
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add class immediately, CSS handles transition
                    entry.target.classList.remove('opacity-0', 'translate-y-12', 'blur-sm');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const revealItems = document.querySelectorAll('.reveal-item');
        revealItems.forEach(item => {
            // Initial state: Hidden, pushed down, and BLURRED
            item.classList.add('opacity-0', 'translate-y-12', 'blur-sm', 'transition-all', 'duration-1000', 'ease-out');
            observer.observe(item);
        });


        // --- Contact Form Handling ---
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Contact form submitted!"); // DEBUG LOG

                const button = contactForm.querySelector('button');
                const originalText = button.innerHTML;
                const buttonTextSpan = button.querySelector('span');

                if (buttonTextSpan) {
                    buttonTextSpan.textContent = 'Sending...';
                }
                button.disabled = true;

                // Collect form data
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    // Use relative path for Vercel deployment
                    const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (response.ok) {
                        if (buttonTextSpan) buttonTextSpan.textContent = 'Message Sent!';
                        button.classList.add('bg-green-500', 'text-white');
                        contactForm.reset();
                    } else {
                        throw new Error(result.error || 'Failed to send');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    if (buttonTextSpan) buttonTextSpan.textContent = 'Failed!';
                    button.classList.add('bg-red-500', 'text-white');
                } finally {
                    // Restore button after 3 seconds
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('bg-green-500', 'bg-red-500', 'text-white');
                        button.disabled = false;
                    }, 3000);
                }
            });
        }


        // --- Advanced Animations: 3D Tilt Effect for Project Cards ---
        // A lightweight vanilla implementation of tilt effect
        const tiltElements = document.querySelectorAll('.group[data-cursor="link"]');

        tiltElements.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate rotation based on cursor position
                // Max rotation: +/- 5 deg
                const xPct = x / rect.width;
                const yPct = y / rect.height;

                const xRot = (yPct - 0.5) * 10; // -5 to +5
                const yRot = (0.5 - xPct) * 10; // -5 to +5

                card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.transition = 'transform 0.1s ease-out';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.5s ease-out';
            });
        });

        // --- Advanced Animations: Magnetic Buttons ---
        // Pulls buttons slightly towards the cursor
        // Re-select to catch buttons in header/footer if any match
        const magneticBtns = document.querySelectorAll('a.px-8, button.px-8');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move button slightly (20% of cursor distance)
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                btn.style.transition = 'transform 0.1s ease-out';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            });
        });
    }

});
