import { Grid, Typography, Button, Box } from "@mui/material"
import ImageGallery from "react-image-gallery"

const ProductPage = () => {
  const images = [
    {
      original: "https://example.com/image1.jpg",
      thumbnail: "https://example.com/thumb1.jpg",
    },
    {
      original: "https://example.com/image2.jpg",
      thumbnail: "https://example.com/thumb2.jpg",
    },
  ]

  return (
    <Box className="px-4 md:px-6 py-8 md:py-12">
      <Grid container spacing={4} className="grid-cols-1 md:grid-cols-2">
        <Grid item xs={12} md={6}>
          <ImageGallery items={images} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h1" className="text-2xl md:text-4xl">
            Product Name
          </Typography>
          <Typography variant="body1">
            Product description goes here. This is a sample description that should be replaced with actual product
            details.
          </Typography>
          <Button variant="contained" color="primary" className="mt-4 w-full md:w-auto">
            Buy Now
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProductPage
