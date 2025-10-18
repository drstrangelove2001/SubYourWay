# Contributing to Singlish Video Dubber

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Node version, Python version)
- Error messages or logs

### Suggesting Features

We welcome feature suggestions! Please:
- Check if the feature already exists or is requested
- Describe the feature and its use case
- Explain how it would improve the application

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe what you changed and why
   - Reference any related issues
   - Include screenshots if UI changes

## Development Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any` when possible
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)
- **Comments**: Explain "why", not "what"

### Testing

- Test with various video formats (MP4, MOV, etc.)
- Test with different video lengths (short, medium, long)
- Verify error handling works correctly
- Check API rate limits are respected

### Documentation

- Update README.md if changing features
- Add JSDoc comments for new functions
- Update SETUP_GUIDE.md if setup changes

## Areas for Improvement

Here are some areas where contributions would be especially valuable:

### High Priority
- [ ] Add job queue (Bull/BullMQ) for scalability
- [ ] Implement persistent storage (Redis/PostgreSQL)
- [ ] Add unit and integration tests
- [ ] Improve error handling and user feedback
- [ ] Add video length limits and validation

### Medium Priority
- [ ] Support multiple voices (user selection)
- [ ] Add video preview before/after processing
- [ ] Implement progress websockets (instead of polling)
- [ ] Add batch processing support
- [ ] Create Docker containerization

### Nice to Have
- [ ] Support other languages/dialects
- [ ] Add subtitle generation
- [ ] Implement audio quality settings
- [ ] Add video editing features (trim, crop)
- [ ] Create admin dashboard

## Questions?

Feel free to open an issue for any questions about contributing!

---

Thank you for making this project better! 🙏

