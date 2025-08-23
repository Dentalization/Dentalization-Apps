const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

/**
 * GET /api/v1/resources/:resourceId
 * Get visualization resource by ID
 * Supports format parameter: 'file', 'base64', 'url'
 */
router.get('/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { format = 'file' } = req.query;

    // Validate resourceId format
    if (!resourceId || typeof resourceId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource ID'
      });
    }

    // Check if resourceId follows gen_* format (AI-generated resource)
    if (resourceId.startsWith('gen_')) {
      // For AI-generated resources, we need to fetch from external AI service
      // This should integrate with the actual AI service that generates visualizations
      try {
        // In production, this would call the actual AI service API
        // For now, we'll use the production endpoint as a proxy
        const aiResponse = await fetch(`https://api.dentalization.id/api/v1/resources/${resourceId}?format=${format}`);
        
        if (aiResponse.ok) {
          if (format === 'base64') {
            const aiData = await aiResponse.json();
            return res.json(aiData);
          } else if (format === 'url') {
            const aiData = await aiResponse.json();
            return res.json(aiData);
          } else {
            // Return blob for file format
            const blob = await aiResponse.buffer();
            res.set({
              'Content-Type': 'image/png',
              'Content-Length': blob.length,
              'Cache-Control': 'public, max-age=3600'
            });
            return res.send(blob);
          }
        } else {
          // Fallback to dummy data if AI service is unavailable
          console.warn(`AI service unavailable for ${resourceId}, using fallback`);
        }
      } catch (error) {
        console.error('Error fetching from AI service:', error);
        // Continue to fallback dummy data
      }
    }
    
    // Fallback: simulate visualization data for testing
    if (format === 'base64') {
      // Generate a simple base64 encoded image (1x1 pixel PNG for testing)
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      return res.json({
        success: true,
        data: {
          data: base64Data,
          resourceId: resourceId,
          format: 'base64',
          contentType: 'image/png'
        }
      });
    } else if (format === 'url') {
      return res.json({
        success: true,
        data: {
          url: `/api/v1/resources/${resourceId}?format=file`,
          resourceId: resourceId,
          format: 'url'
        }
      });
    } else {
      // Return as file/blob
      // Create a simple 1x1 pixel PNG buffer for testing
      const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': pngBuffer.length,
        'Cache-Control': 'public, max-age=3600'
      });
      
      return res.send(pngBuffer);
    }
  } catch (error) {
    console.error('Error getting resource:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving resource'
    });
  }
});

module.exports = router;