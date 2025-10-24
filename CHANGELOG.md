# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-10-23

### Added
- **Full TypeScript support** - Complete type definitions for all APIs
- Type exports for Anthropic and OpenAI request/response formats
- TypeScript definitions for streaming events and proxy configuration
- Enhanced IntelliSense support for IDE integration
- Comprehensive TypeScript documentation (`TYPESCRIPT.md`)
- `typescript` and `types` keywords for better npm discovery

### Changed
- Codebase migrated from JavaScript to TypeScript
- Improved type safety throughout the codebase
- Better error handling with typed responses
- Updated build process to compile TypeScript to JavaScript
- Enhanced package configuration with automated scripts

### Technical Details
- Target: ES2022 (Node.js 18+)
- Module: ESNext for ESM compatibility
- Strict mode enabled for maximum type safety
- Source maps generated for debugging
- Declaration files (.d.ts) included in package

### Developer Experience
- Full auto-completion in supported IDEs
- Compile-time error detection
- Self-documenting code through interfaces
- Better refactoring support
- Type-safe API conversions

## [2.0.0] - 2024-10-22

### Added
- Initial release as npm package
- GLM-4.5-Air model integration
- Format conversion between Anthropic and OpenAI APIs
- Tool calling support
- Streaming response handling
- Comprehensive logging system
- CLI interface with multiple options

### Features
- Proxy server for Claude Code CLI
- Health check endpoint
- Models list endpoint
- Environment variable configuration
- Color-coded logging
- Error handling and recovery