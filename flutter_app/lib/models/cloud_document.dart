class CloudDocument {
  final String id;
  final String name;
  final String documentType; // 'Insurance PDF', 'Fuel Bills', 'Service Bills', 'Tyre Bills', 'Battery Bills', 'RC', 'Fitness Certificate', 'Driving License', 'Salary Receipt'
  final String source; // 'Camera', 'Gallery', 'PDF'
  final DateTime uploadedAt;
  final String fileSize;
  final String storageUrl;
  final String? notes;

  CloudDocument({
    required this.id,
    required this.name,
    required this.documentType,
    required this.source,
    required this.uploadedAt,
    required this.fileSize,
    required this.storageUrl,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'documentType': documentType,
    'source': source,
    'uploadedAt': uploadedAt.toIso8601String(),
    'fileSize': fileSize,
    'storageUrl': storageUrl,
    'notes': notes,
  };

  factory CloudDocument.fromJson(Map<String, dynamic> json) => CloudDocument(
    id: json['id'],
    name: json['name'],
    documentType: json['documentType'],
    source: json['source'],
    uploadedAt: DateTime.parse(json['uploadedAt']),
    fileSize: json['fileSize'],
    storageUrl: json['storageUrl'],
    notes: json['notes'],
  );
}
