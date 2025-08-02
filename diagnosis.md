{
	"info": {
		"_postman_id": "653da433-ddf8-42ff-a10f-bda61eaca125",
		"name": "Dental Reasoning Agent API",
		"description": "Koleksi untuk menguji API Dental Reasoning Agent dengan deteksi kondisi gigi dan reasoning LLM",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "29741804"
	},
	"item": [
		{
			"name": "Health Check",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{base_url}}/api/health",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"api",
						"health"
					]
				},
				"description": "Memeriksa status API dan model"
			},
			"response": []
		},
		{
			"name": "Detect Dental Conditions",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Accept",
						"value": "application/json",
						"type": "text"
					}
				],
				"body": {
					"mode": "formdata",
					"formdata": [
						{
							"key": "image",
							"description": "Gambar gigi untuk dideteksi (JPG, JPEG, PNG)",
							"type": "file",
							"src": "/path/to/dental_image.jpg"
						}
					]
				},
				"url": {
					"raw": "{{base_url}}/api/detect?generate_visualization=true",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"api",
						"detect"
					],
					"query": [
						{
							"key": "generate_visualization",
							"value": "true"
						}
					]
				},
				"description": "Deteksi kondisi gigi dalam gambar menggunakan YOLOv8"
			},
			"response": []
		},
		{
			"name": "Dental Reasoning",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Accept",
						"value": "application/json",
						"type": "text"
					}
				],
				"body": {
					"mode": "formdata",
					"formdata": [
						{
							"key": "image",
							"description": "Gambar gigi untuk dideteksi (JPG, JPEG, PNG)",
							"type": "file",
							"src": "/path/to/dental_image.jpg"
						},
						{
							"key": "patient_info",
							"value": "{\n  \"name\": \"Pasien Contoh\",\n  \"age\": 35,\n  \"gender\": \"pria\",\n  \"chief_complaint\": \"Nyeri pada gigi belakang kanan bawah sejak 3 hari\",\n  \"medical_history\": \"Tidak ada riwayat medis signifikan\",\n  \"dental_history\": \"Pembersihan karang gigi terakhir 1 tahun yang lalu\"\n}",
							"description": "Informasi pasien (opsional)",
							"type": "text"
						}
					]
				},
				"url": {
					"raw": "{{base_url}}/api/reason?generate_visualization=true&generate_report=true",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"api",
						"reason"
					],
					"query": [
						{
							"key": "generate_visualization",
							"value": "true"
						},
						{
							"key": "generate_report",
							"value": "true"
						}
					]
				},
				"description": "Deteksi kondisi gigi dan lakukan analisis reasoning dengan LLM"
			},
			"response": []
		},
		{
			"name": "Batch Detect",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Accept",
						"value": "application/json",
						"type": "text"
					}
				],
				"body": {
					"mode": "formdata",
					"formdata": [
						{
							"key": "images",
							"description": "Gambar gigi pertama (JPG, JPEG, PNG)",
							"type": "file",
							"src": "/path/to/dental_image1.jpg"
						},
						{
							"key": "images",
							"description": "Gambar gigi kedua (JPG, JPEG, PNG)",
							"type": "file",
							"src": "/path/to/dental_image2.jpg"
						}
					]
				},
				"url": {
					"raw": "{{base_url}}/api/batch-detect?generate_visualization=true",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"api",
						"batch-detect"
					],
					"query": [
						{
							"key": "generate_visualization",
							"value": "true"
						}
					]
				},
				"description": "Deteksi kondisi gigi dalam beberapa gambar secara batch"
			},
			"response": []
		},
		{
			"name": "Get Visualization/Report File",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{base_url}}/api/files/data/results/detection_20250704_123456.jpg",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"api",
						"files",
						"data",
						"results",
						"detection_20250704_123456.jpg"
					]
				},
				"description": "Mengambil file visualisasi atau laporan (ganti path sesuai URL yang dikembalikan API)"
			},
			"response": []
		}
	],
	"variable": [
		{
			"key": "base_url",
			"value": "https://development-srv.tail2fe625.ts.net/",
			"type": "string"
		}
	]
}