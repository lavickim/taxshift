import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import '../utils/connection_test.dart';
import '../config/api_config.dart';

class DebugConnectionScreen extends StatefulWidget {
  const DebugConnectionScreen({Key? key}) : super(key: key);

  @override
  _DebugConnectionScreenState createState() => _DebugConnectionScreenState();
}

class _DebugConnectionScreenState extends State<DebugConnectionScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _diagnosticResults;
  String _quickTestResult = '';

  @override
  void initState() {
    super.initState();
    _runQuickTest();
  }

  Future<void> _runQuickTest() async {
    setState(() {
      _quickTestResult = 'Testing...';
    });

    bool isConnected = await ConnectionTest.quickConnectivityTest();
    setState(() {
      _quickTestResult = isConnected ? '✅ Connection OK' : '❌ Connection Failed';
    });
  }

  Future<void> _runFullDiagnostic() async {
    setState(() {
      _isLoading = true;
      _diagnosticResults = null;
    });

    try {
      final results = await ConnectionTest.runFullDiagnostic();
      setState(() {
        _diagnosticResults = results;
      });
    } catch (e) {
      setState(() {
        _diagnosticResults = {'error': e.toString()};
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Copied to clipboard')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connection Debug'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _runQuickTest,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildConfigSection(),
            const SizedBox(height: 20),
            _buildQuickTestSection(),
            const SizedBox(height: 20),
            _buildDiagnosticSection(),
            if (_diagnosticResults != null) ...[
              const SizedBox(height: 20),
              _buildResultsSection(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildConfigSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.settings, color: Colors.blue),
                const SizedBox(width: 8),
                const Text('Configuration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            _buildInfoRow('Base URL', ApiConfig.baseUrl),
            _buildInfoRow('ngrok URL', ApiConfig.ngrokUrl),
            _buildInfoRow('Emulator URL', ApiConfig.emulatorUrl),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickTestSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.speed, color: Colors.green),
                const SizedBox(width: 8),
                const Text('Quick Test', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_quickTestResult, style: const TextStyle(fontSize: 16)),
                ElevatedButton(
                  onPressed: _runQuickTest,
                  child: const Text('Test Now'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiagnosticSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.bug_report, color: Colors.orange),
                const SizedBox(width: 8),
                const Text('Full Diagnostic', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Run comprehensive connection and API tests'),
            const SizedBox(height: 12),
            Center(
              child: ElevatedButton.icon(
                onPressed: _isLoading ? null : _runFullDiagnostic,
                icon: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.play_arrow),
                label: Text(_isLoading ? 'Running...' : 'Run Diagnostic'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsSection() {
    if (_diagnosticResults!.containsKey('error')) {
      return Card(
        color: Colors.red[50],
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Error', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
              const SizedBox(height: 8),
              Text(_diagnosticResults!['error'].toString()),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        _buildDeviceInfoCard(),
        const SizedBox(height: 12),
        _buildNetworkTestsCard(),
        const SizedBox(height: 12),
        _buildApiTestsCard(),
        const SizedBox(height: 12),
        _buildRecommendationsCard(),
        const SizedBox(height: 12),
        _buildRawDataCard(),
      ],
    );
  }

  Widget _buildDeviceInfoCard() {
    final deviceInfo = _diagnosticResults!['device_info'] as Map<String, dynamic>;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Device Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...deviceInfo.entries.map((entry) => _buildInfoRow(entry.key, entry.value.toString())),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkTestsCard() {
    final networkTests = _diagnosticResults!['network_tests'] as Map<String, dynamic>;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Network Tests', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...networkTests.entries.map((entry) => _buildTestResult(entry.key, entry.value as Map<String, dynamic>)),
          ],
        ),
      ),
    );
  }

  Widget _buildApiTestsCard() {
    final apiTests = _diagnosticResults!['api_tests'] as Map<String, dynamic>;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('API Tests', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...apiTests.entries.map((entry) => _buildTestResult(entry.key, entry.value as Map<String, dynamic>)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationsCard() {
    final recommendations = _diagnosticResults!['recommendations'] as List<dynamic>;
    
    return Card(
      color: recommendations.any((r) => r.toString().startsWith('❌')) ? Colors.red[50] : Colors.green[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Recommendations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...recommendations.map((rec) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text('• $rec'),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildRawDataCard() {
    final jsonString = const JsonEncoder.withIndent('  ').convert(_diagnosticResults);
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Raw Data', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: () => _copyToClipboard(jsonString),
                  icon: const Icon(Icons.copy),
                  label: const Text('Copy'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                jsonString,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String key, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text('$key:', style: const TextStyle(fontWeight: FontWeight.w500))),
          Expanded(child: SelectableText(value)),
        ],
      ),
    );
  }

  Widget _buildTestResult(String testName, Map<String, dynamic> result) {
    final status = result['status'] as String;
    final message = result['message'] as String;
    
    Color statusColor = Colors.grey;
    IconData statusIcon = Icons.help;
    
    switch (status) {
      case 'success':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'failure':
        statusColor = Colors.red;
        statusIcon = Icons.error;
        break;
      case 'partial':
        statusColor = Colors.orange;
        statusIcon = Icons.warning;
        break;
    }
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(statusIcon, color: statusColor, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(testName, style: const TextStyle(fontWeight: FontWeight.w500)),
                Text(message, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}