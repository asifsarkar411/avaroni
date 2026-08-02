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
        <section className="reviews-slider-section" id="reviews-slider-section" style={{ display: 'block' }}>
            <div className="reviews-slider-container">
                <h2 className="section-title"><i className="fas fa-star" style={{color:'#ffc107'}}></i> What Our Customers Say <i className="fas fa-star" style={{color:'#ffc107'}}></i></h2>
                <p className="section-subtitle">Real reviews from our valued shoppers</p>
                
                <div className="reviews-slider-wrapper">
                    <div className="reviews-slides" style={{ transform: `translateX(-${currentIndex * 100}%)`, display: 'flex', transition: 'transform 0.5s ease' }}>
                        {reviews.map((review) => (
                            <div key={review._id} className="review-card" style={{ minWidth: '100%', boxSizing: 'border-box' }}>
                                <div className="review-rating">{renderStars(review.rating)}</div>
                                <p className="review-text">"{review.comment}"</p>
                                <h4 className="reviewer-name">{review.reviewerName}</h4>
                                <small className="review-product">on {review.productName}</small>
                            </div>
                        ))}
                    </div>
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
