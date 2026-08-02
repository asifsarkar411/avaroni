'use client';
import { useState, useEffect } from 'react';

export default function ReviewsSlider() {
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch('/api/reviews/published');
                const data = await res.json();
                if (data.success && data.reviews && data.reviews.length > 0) {
                    setReviews(data.reviews);
                }
            } catch (err) {
                console.error("Error fetching reviews", err);
            }
        }
        fetchReviews();
    }, []);

    useEffect(() => {
        if (reviews.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    if (reviews.length === 0) return null;

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<i key={i} className={i <= rating ? "fas fa-star" : "far fa-star"} style={{color: '#ffc107', margin: '0 2px'}}></i>);
        }
        return stars;
    };

    return (
        <section style={{ padding: '60px 20px', background: '#f8f9fa', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}><i className="fas fa-star" style={{color:'#ffc107'}}></i> What Our Customers Say <i className="fas fa-star" style={{color:'#ffc107'}}></i></h2>
                <p style={{ color: '#666', marginBottom: '40px' }}>Real reviews from our valued shoppers</p>
                
                <div style={{ position: 'relative', minHeight: '200px', overflow: 'hidden' }}>
                    {reviews.map((review, index) => (
                        <div key={review._id} style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            opacity: index === currentIndex ? 1 : 0,
                            transform: 	ranslateX(px),
                            transition: 'all 0.6s ease-in-out',
                            pointerEvents: index === currentIndex ? 'auto' : 'none'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '30px',
                                borderRadius: '16px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                display: 'inline-block',
                                width: '100%',
                                maxWidth: '600px'
                            }}>
                                <div style={{ marginBottom: '15px' }}>{renderStars(review.rating)}</div>
                                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#444', lineHeight: '1.6', marginBottom: '20px' }}>
                                    "{review.comment}"
                                </p>
                                <h4 style={{ margin: 0, color: '#111' }}>{review.reviewerName}</h4>
                                <small style={{ color: '#888' }}>on {review.productName}</small>
                            </div>
                        </div>
                    ))}
                </div>

                {reviews.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                        {reviews.map((_, i) => (
                            <div key={i} onClick={() => setCurrentIndex(i)} style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: i === currentIndex ? '#111' : '#ccc',
                                cursor: 'pointer',
                                transition: 'background 0.3s ease'
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
