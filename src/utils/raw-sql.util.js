exports.getTotalReviewsForArtistInOrderQuery = () => {
  return `(SELECT CAST(COUNT("Review"."artistId") AS INTEGER)
  FROM "Review"
  WHERE "Review"."artistId" = "orderArtist"."artistId")`;
};
