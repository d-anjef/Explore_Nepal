import { Rating } from "@mui/material";
import React, { useState, useMemo } from "react";
import { FaRegClock, FaMapMarkerAlt, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getPackageImage } from "../utils/imageFallback";

const PackageCard = ({ packageData }) => {
  const packageImage = getPackageImage(packageData);
  const [imgError, setImgError] = useState(false);

  // Deterministic Rating (Kept your logic)
  const fakeRatingData = useMemo(() => {
    const id = packageData?._id || "1";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rating = 4.2 + (Math.abs(hash % 8) / 10);
    const reviews = 20 + (Math.abs(hash % 50));
    return { rating: parseFloat(rating.toFixed(1)), reviews };
  }, [packageData?._id]);

  const finalRating = packageData?.packageTotalRatings > 0 ? packageData.packageRating : fakeRatingData.rating;
  const finalReviews = packageData?.packageTotalRatings > 0 ? packageData.packageTotalRatings : fakeRatingData.reviews;

  return (
    <Link to={`/package/${packageData._id}`} className="group block w-full">
      <div className="relative w-full bg-white transition-all duration-500">
        
        {/* Minimal Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-50">
          {!imgError ? (
            <img
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              src={packageImage}
              alt={packageData?.packageName}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 p-6">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {packageData?.packageName}
              </span>
            </div>
          )}

          {/* Minimal Discount Badge */}
          {packageData.packageOffer && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-black text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm">
              {Math.floor(((packageData.packagePrice - packageData.packageDiscountPrice) / packageData.packagePrice) * 100)}% OFF
            </div>
          )}

          {/* Quick Book Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                Book Experience
             </span>
          </div>
        </div>

        {/* Minimal Content Section */}
        <div className="pt-4 pb-2 px-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              {packageData.packageDestination}
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-400">
              <FaRegClock size={10} />
              <span className="text-[9px] font-medium">{packageData.packageDays} Days</span>
            </div>
          </div>

          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
            {packageData.packageName}
          </h3>

          <div className="flex items-center justify-between mt-3">
            {/* Price section */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">
                Rs {(packageData.packageOffer ? packageData.packageDiscountPrice : packageData.packagePrice).toLocaleString()}
              </span>
              {packageData.packageOffer && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  Rs {packageData.packagePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Subtle Rating */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
              <Rating
                value={finalRating}
                size="small"
                readOnly
                precision={0.1}
                sx={{ color: '#000', fontSize: '0.75rem' }}
              />
              <span className="text-[10px] font-black text-slate-900">{finalRating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;