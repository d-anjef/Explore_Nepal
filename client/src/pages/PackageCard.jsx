import { Rating } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getPackageImage, handleImageError } from "../utils/imageFallback";
import "./styles/PackageCard.css";

const PackageCard = ({ packageData }) => {
  const packageImage = getPackageImage(packageData);
  const [imgError, setImgError] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log("PackageCard data:", {
      name: packageData?.packageName,
      id: packageData?._id,
      hasImages: packageData?.packageImages?.length > 0,
      imageUrl: packageImage
    });
  }, [packageData, packageImage]);
  
  return (
    <Link to={`/package/${packageData._id}`} className="w-full">
      <div className="w-full bg-white border flex flex-col items-center p-3 rounded shadow-md overflow-hidden">
        {!imgError ? (
          <img
            className="w-full h-[220px] rounded border hover:scale-110  transition-all duration-300 object-cover"
            src={packageImage}
            alt={packageData?.packageName || "Package Image"}
            onError={(e) => {
              console.log("Image failed to load:", packageImage);
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-[220px] rounded border bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <p className="text-2xl font-bold mb-2">📸</p>
              <p className="text-sm font-semibold">{packageData?.packageName?.substring(0, 30) || 'Travel Package'}</p>
            </div>
          </div>
        )}
        <div className="w-full flex flex-col my-2">
          <p className="font-semibold text-lg capitalize truncate w-full" title={packageData.packageName}>
            {packageData.packageName}
          </p>
          <p className="text-green-700 text-lg capitalize truncate w-full" title={packageData.packageDestination}>
            {packageData.packageDestination}
          </p>
          {(+packageData.packageDays > 0 || +packageData.packageNights > 0) && (
            <p className="flex text-lg items-center gap-2">
              <FaClock />
              {+packageData.packageDays > 0 &&
                (+packageData.packageDays > 1
                  ? packageData.packageDays + " Days"
                  : packageData.packageDays + " Day")}
              {+packageData.packageDays > 0 &&
                +packageData.packageNights > 0 &&
                " - "}
              {+packageData.packageNights > 0 &&
                (+packageData.packageNights > 1
                  ? packageData.packageNights + " Nights"
                  : packageData.packageNights + " Night")}
            </p>
          )}
          {/* rating */}
          <div className="min-h-[28px] flex items-center my-1">
            {packageData.packageTotalRatings > 0 ? (
              <div className="flex items-center gap-1">
                <Rating
                  value={packageData.packageRating}
                  size="small"
                  readOnly
                  precision={0.1}
                />
                <span className="text-sm text-gray-600">({packageData.packageTotalRatings})</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No ratings yet</span>
            )}
          </div>
          
          {/* price */}
          <div className="mt-1">
            {packageData.packageOffer && packageData.packageDiscountPrice ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-green-700">
                  Rs {packageData.packageDiscountPrice}
                </span>
                <span className="line-through text-gray-500 text-sm">
                  Rs {packageData.packagePrice}
                </span>
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {Math.floor(((packageData.packagePrice - packageData.packageDiscountPrice) / packageData.packagePrice) * 100)}% OFF
                </span>
              </div>
            ) : (
              <p className="text-lg font-bold text-green-700">
                Rs {packageData.packagePrice}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;
