const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save AI diagnosis result
const saveDiagnosis = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      patientId,
      imageUrl,
      detectionResult,
      reasoningResult,
      reportUrl,
      requestId,
      aiServerResponse
    } = req.body;

    // Validate required fields
    if (!detectionResult || !reasoningResult) {
      return res.status(400).json({
        success: false,
        message: 'Detection result and reasoning result are required'
      });
    }

    // Create AI diagnosis record
    const aiDiagnosis = await prisma.aiDiagnosis.create({
      data: {
        userId,
        patientId: patientId || null,
        imageUrl: imageUrl || null,
        detectionResult: JSON.stringify(detectionResult),
        reasoningResult: JSON.stringify(reasoningResult),
        reportUrl: reportUrl || null,
        requestId: requestId || null,
        aiServerResponse: aiServerResponse ? JSON.stringify(aiServerResponse) : null,
        diagnosisDate: new Date()
      }
    });

    res.json({
      success: true,
      message: 'AI diagnosis saved successfully',
      data: {
        id: aiDiagnosis.id,
        diagnosisDate: aiDiagnosis.diagnosisDate,
        requestId: aiDiagnosis.requestId
      }
    });
  } catch (error) {
    console.error('Save AI diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving AI diagnosis'
    });
  }
};

// Get AI diagnosis history for a specific patient (for doctors)
const getDiagnosisHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const diagnoses = await prisma.aiDiagnosis.findMany({
      where: {
        patientId: patientId
      },
      orderBy: {
        diagnosisDate: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            doctorProfile: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          }
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const total = await prisma.aiDiagnosis.count({
      where: {
        patientId: patientId
      }
    });

    // Parse JSON fields
    const formattedDiagnoses = diagnoses.map(diagnosis => ({
      ...diagnosis,
      detectionResult: JSON.parse(diagnosis.detectionResult),
      reasoningResult: JSON.parse(diagnosis.reasoningResult),
      aiServerResponse: diagnosis.aiServerResponse ? JSON.parse(diagnosis.aiServerResponse) : null
    }));

    res.json({
      success: true,
      data: {
        diagnoses: formattedDiagnoses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get diagnosis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving diagnosis history'
    });
  }
};

// Get AI diagnosis history for current user (for patients)
const getMyDiagnosisHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const diagnoses = await prisma.aiDiagnosis.findMany({
      where: {
        OR: [
          { userId: userId },
          { patientId: userId }
        ]
      },
      orderBy: {
        diagnosisDate: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            doctorProfile: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.aiDiagnosis.count({
      where: {
        OR: [
          { userId: userId },
          { patientId: userId }
        ]
      }
    });

    // Parse JSON fields
    const formattedDiagnoses = diagnoses.map(diagnosis => ({
      ...diagnosis,
      detectionResult: JSON.parse(diagnosis.detectionResult),
      reasoningResult: JSON.parse(diagnosis.reasoningResult),
      aiServerResponse: diagnosis.aiServerResponse ? JSON.parse(diagnosis.aiServerResponse) : null
    }));

    res.json({
      success: true,
      data: {
        diagnoses: formattedDiagnoses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my diagnosis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving diagnosis history'
    });
  }
};

// Get specific AI diagnosis by ID
const getDiagnosisById = async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const userId = req.user.id;

    const diagnosis = await prisma.aiDiagnosis.findFirst({
      where: {
        id: diagnosisId,
        OR: [
          { userId: userId },
          { patientId: userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            doctorProfile: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          }
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    // Parse JSON fields
    const formattedDiagnosis = {
      ...diagnosis,
      detectionResult: JSON.parse(diagnosis.detectionResult),
      reasoningResult: JSON.parse(diagnosis.reasoningResult),
      aiServerResponse: diagnosis.aiServerResponse ? JSON.parse(diagnosis.aiServerResponse) : null
    };

    res.json({
      success: true,
      data: formattedDiagnosis
    });
  } catch (error) {
    console.error('Get diagnosis by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving diagnosis'
    });
  }
};

// Delete AI diagnosis
const deleteDiagnosis = async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const userId = req.user.id;

    // Check if diagnosis exists and belongs to user
    const diagnosis = await prisma.aiDiagnosis.findFirst({
      where: {
        id: diagnosisId,
        OR: [
          { userId: userId },
          { patientId: userId }
        ]
      }
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    await prisma.aiDiagnosis.delete({
      where: {
        id: diagnosisId
      }
    });

    res.json({
      success: true,
      message: 'Diagnosis deleted successfully'
    });
  } catch (error) {
    console.error('Delete diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting diagnosis'
    });
  }
};

// Get AI diagnosis statistics
const getDiagnosisStats = async (req, res) => {
  try {
    const { patientId } = req.query;
    const userId = req.user.id;

    let whereClause;
    if (patientId) {
      whereClause = { patientId: patientId };
    } else {
      whereClause = {
        OR: [
          { userId: userId },
          { patientId: userId }
        ]
      };
    }

    const totalDiagnoses = await prisma.aiDiagnosis.count({
      where: whereClause
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDiagnoses = await prisma.aiDiagnosis.count({
      where: {
        ...whereClause,
        diagnosisDate: {
          gte: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalDiagnoses,
        recentDiagnoses
      }
    });
  } catch (error) {
    console.error('Get diagnosis stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving diagnosis statistics'
    });
  }
};

module.exports = {
  saveDiagnosis,
  getDiagnosisHistory,
  getMyDiagnosisHistory,
  getDiagnosisById,
  deleteDiagnosis,
  getDiagnosisStats
};