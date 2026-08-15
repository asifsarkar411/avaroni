'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const faqs = [
        {
            category: 'ordering',
            q: 'How do I place an order on AVARONI?',
            a: 'Placing an order is simple! Browse our collections (Women, Kids, Ornaments), select your desired items along with size/color options, add them to your cart, and proceed to checkout with your delivery address and preferred payment method.'
        },
        {
            category: 'ordering',
            q: 'Can I place an order via WhatsApp or Phone?',
            a: 'Yes, absolutely! You can contact our customer support team directly through our WhatsApp hotline or call our official customer care number to place cash-on-delivery orders.'
        },
        {
            category: 'shipping',
            q: 'What are your delivery charges and shipping times across Bangladesh?',
            a: 'Inside Dhaka: ৳60 (1-2 business days). Outside Dhaka (all 64 districts): ৳120 (2-4 business days). Express same-day delivery inside Dhaka is also available upon request.'
        },
        {
            category: 'shipping',
            q: 'Can I check the package in front of the delivery rider?',
            a: 'Yes! We encourage customers to inspect their package contents and verify items with the delivery agent before completing the payment for Cash on Delivery orders.'
        },
        {
            category: 'payment',
            q: 'What payment methods do you accept?',
            a: 'We accept Cash on Delivery (COD) across all 64 districts in Bangladesh, as well as bKash, Nagad, Rocket, and Visa/MasterCard online payments.'
        },
        {
            category: 'returns',
            q: 'What is your return and exchange policy?',
            a: 'We provide a 7-day hassle-free return and exchange policy for unworn, unwashed items in their original condition with tags attached. You can submit a return request online via our Return Product page.'
        },
        {
            category: 'returns',
            q: 'How long does a refund take to process?',
            a: 'Once your returned product is inspected and approved at our hub, refunds are processed within 3-5 business days via your original payment channel (bKash/Nagad/Bank Transfer).'
        },
        {
            category: 'sizing',
            q: 'How do I choose the correct size?',
            a: 'Every product page features a detailed sizing chart with measurements in inches for chest, length, waist, and sleeves. If you are unsure between sizes, our customer team is happy to assist with recommendations.'
        },
        {
            category: 'sizing',
            q: 'Are your ornaments and jewelry authentic handcrafted items?',
            a: 'Yes! All our jewelry collections feature authentic artisanal craftsmanship, premium gold/silver plating, high-grade stones, and skin-friendly hypoallergenic materials.'
        }
    ];

    const toggleAccordion = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    const filteredFaqs = faqs.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesQuery = !searchQuery || item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    return (
        <div style={{ background: '#f5f5f7', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 50%, #2a111e 100%)',
                color: '#ffffff',
                padding: '65px 20px 55px',
                textAlign: 'center',
                borderBottom: '3px solid rgba(230, 0, 80, 0.3)'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(230, 0, 80, 0.2)',
                    color: '#ff80aa',
                    border: '1px solid rgba(230, 0, 80, 0.4)',
                    padding: '6px 18px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginBottom: '18px'
                }}>
                    <i className="fas fa-question-circle"></i> Help & Customer Support
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                    Frequently Asked <span style={{ color: '#ff80aa' }}>Questions</span>
                </h1>
                <p style={{ color: '#d1d5db', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.6' }}>
                    Find immediate answers to common questions about orders, payments, shipping, sizing, and returns at AVARONI.
                </p>

                {/* Search Bar */}
                <div style={{
                    maxWidth: '580px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 20px',
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <i className="fas fa-search" style={{ color: '#ff80aa', marginRight: '12px' }}></i>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for answers (e.g. shipping, payment, refund)..."
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '15px'
                        }}
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ maxWidth: '850px', margin: '30px auto 0', padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
                    {[
                        { id: 'all', label: 'All Topics', icon: 'fa-th-large' },
                        { id: 'ordering', label: 'Ordering', icon: 'fa-shopping-bag' },
                        { id: 'shipping', label: 'Shipping & Delivery', icon: 'fa-truck' },
                        { id: 'payment', label: 'Payments', icon: 'fa-credit-card' },
                        { id: 'returns', label: 'Returns & Refunds', icon: 'fa-undo' },
                        { id: 'sizing', label: 'Sizing & Jewelry', icon: 'fa-ruler' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                padding: '8px 18px',
                                borderRadius: '25px',
                                border: '1px solid ' + (activeCategory === cat.id ? '#e60050' : '#e5e7eb'),
                                background: activeCategory === cat.id ? '#e60050' : '#ffffff',
                                color: activeCategory === cat.id ? '#ffffff' : '#374151',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                        >
                            <i className={`fas ${cat.icon}`}></i> {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <button
                                    onClick={() => toggleAccordion(idx)}
                                    style={{
                                        width: '100%',
                                        padding: '18px 22px',
                                        background: isOpen ? '#fff1f5' : '#ffffff',
                                        border: 'none',
                                        outline: 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '15px', fontWeight: '700', color: isOpen ? '#e60050' : '#111827' }}>
                                        {faq.q}
                                    </span>
                                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: isOpen ? '#e60050' : '#9ca3af', marginLeft: '15px' }}></i>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '16px 22px 20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.7', borderTop: '1px solid #fee2e2' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredFaqs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6b7280' }}>
                            <i className="fas fa-search" style={{ fontSize: '32px', marginBottom: '12px', color: '#cbd5e1' }}></i>
                            <h4 style={{ margin: '0 0 6px', color: '#111827' }}>No questions found matching your search</h4>
                            <p style={{ margin: 0, fontSize: '14px' }}>Try searching for a different keyword or contact our support team directly.</p>
                        </div>
                    )}
                </div>

                {/* Need more help banner */}
                <div style={{
                    marginTop: '40px',
                    background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                    borderRadius: '16px',
                    padding: '30px',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800' }}>Still have questions?</h3>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Our friendly support team is available 7 days a week to help you.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link
                            href="/contact"
                            style={{
                                padding: '10px 20px',
                                background: '#e60050',
                                color: '#ffffff',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '13px',
                                textDecoration: 'none'
                            }}
                        >
                            <i className="fas fa-envelope"></i> Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
