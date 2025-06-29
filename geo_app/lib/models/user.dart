class User {
  final String id;
  final String username;
  final String firstName;
  final String lastName;
  final String email;
  final bool isActive;

  User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      email: json['email'],
      isActive: json['isActive'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'isActive': isActive,
    };
  }

  // Helper getters for backward compatibility and convenience
  String get name => '$firstName $lastName';
  String get displayName => username;
  String get fullName => '$firstName $lastName';
}
