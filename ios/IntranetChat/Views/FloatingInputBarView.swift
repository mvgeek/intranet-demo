import UIKit

protocol FloatingInputBarDelegate: AnyObject {
    func inputBarDidSendMessage(_ text: String, isVoiceInput: Bool)
    func inputBarDidToggleInputMode(_ isVoiceMode: Bool)
}

class FloatingInputBarView: UIView {
    
    // MARK: - UI Components
    private let containerView = UIView()
    private let textView = UITextView()
    private let placeholderLabel = UILabel()
    private let sendButton = UIButton(type: .system)
    private let voiceToggleButton = UIButton(type: .system)
    private let textViewMaxHeight: CGFloat = 100
    
    // MARK: - Properties
    weak var delegate: FloatingInputBarDelegate?
    private var isVoiceMode = false
    private var textViewHeightConstraint: NSLayoutConstraint!
    
    // MARK: - Initialization
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
        setupConstraints()
        updateSendButtonState()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        backgroundColor = UIColor.clear
        
        setupContainer()
        setupTextView()
        setupPlaceholder()
        setupButtons()
    }
    
    private func setupContainer() {
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = UIColor.systemBackground
        containerView.layer.cornerRadius = 22
        containerView.layer.borderWidth = 1
        containerView.layer.borderColor = UIColor.separator.cgColor
        
        // Add subtle shadow
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOffset = CGSize(width: 0, height: 2)
        containerView.layer.shadowOpacity = 0.1
        containerView.layer.shadowRadius = 8
        
        addSubview(containerView)
    }
    
    private func setupTextView() {
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.font = UIFont.systemFont(ofSize: 16)
        textView.backgroundColor = UIColor.clear
        textView.textColor = UIColor.label
        textView.textContainerInset = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
        textView.textContainer.lineFragmentPadding = 0
        textView.scrollIndicatorInsets = textView.textContainerInset
        textView.isScrollEnabled = false
        textView.delegate = self
        textView.layer.cornerRadius = 18
        textView.backgroundColor = UIColor.systemGray6
        
        containerView.addSubview(textView)
    }
    
    private func setupPlaceholder() {
        placeholderLabel.translatesAutoresizingMaskIntoConstraints = false
        placeholderLabel.text = "Type a message..."
        placeholderLabel.font = UIFont.systemFont(ofSize: 16)
        placeholderLabel.textColor = UIColor.placeholderText
        placeholderLabel.isUserInteractionEnabled = false
        
        textView.addSubview(placeholderLabel)
    }
    
    private func setupButtons() {
        setupVoiceToggleButton()
        setupSendButton()
    }
    
    private func setupVoiceToggleButton() {
        voiceToggleButton.translatesAutoresizingMaskIntoConstraints = false
        voiceToggleButton.setImage(UIImage(systemName: "mic"), for: .normal)
        voiceToggleButton.setImage(UIImage(systemName: "keyboard"), for: .selected)
        voiceToggleButton.tintColor = UIColor.systemBlue
        voiceToggleButton.backgroundColor = UIColor.clear
        voiceToggleButton.layer.cornerRadius = 20
        voiceToggleButton.addTarget(self, action: #selector(voiceToggleButtonTapped), for: .touchUpInside)
        
        // Add subtle background
        voiceToggleButton.backgroundColor = UIColor.systemGray6
        
        containerView.addSubview(voiceToggleButton)
    }
    
    private func setupSendButton() {
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setImage(UIImage(systemName: "arrow.up.circle.fill"), for: .normal)
        sendButton.tintColor = UIColor.systemBlue
        sendButton.contentMode = .scaleAspectFit
        sendButton.addTarget(self, action: #selector(sendButtonTapped), for: .touchUpInside)
        
        // Style the send button
        sendButton.backgroundColor = UIColor.clear
        sendButton.layer.cornerRadius = 20
        
        containerView.addSubview(sendButton)
    }
    
    private func setupConstraints() {
        // Container constraints
        NSLayoutConstraint.activate([
            containerView.topAnchor.constraint(equalTo: topAnchor),
            containerView.leadingAnchor.constraint(equalTo: leadingAnchor),
            containerView.trailingAnchor.constraint(equalTo: trailingAnchor),
            containerView.bottomAnchor.constraint(equalTo: bottomAnchor),
            containerView.heightAnchor.constraint(greaterThanOrEqualToConstant: 44)
        ])
        
        // Voice toggle button constraints
        NSLayoutConstraint.activate([
            voiceToggleButton.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 8),
            voiceToggleButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -8),
            voiceToggleButton.widthAnchor.constraint(equalToConstant: 40),
            voiceToggleButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Send button constraints
        NSLayoutConstraint.activate([
            sendButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -8),
            sendButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -8),
            sendButton.widthAnchor.constraint(equalToConstant: 40),
            sendButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Text view constraints
        textViewHeightConstraint = textView.heightAnchor.constraint(equalToConstant: 36)
        
        NSLayoutConstraint.activate([
            textView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 4),
            textView.leadingAnchor.constraint(equalTo: voiceToggleButton.trailingAnchor, constant: 8),
            textView.trailingAnchor.constraint(equalTo: sendButton.leadingAnchor, constant: -8),
            textView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -4),
            textViewHeightConstraint
        ])
        
        // Placeholder label constraints
        NSLayoutConstraint.activate([
            placeholderLabel.topAnchor.constraint(equalTo: textView.topAnchor, constant: 10),
            placeholderLabel.leadingAnchor.constraint(equalTo: textView.leadingAnchor, constant: 16),
            placeholderLabel.trailingAnchor.constraint(equalTo: textView.trailingAnchor, constant: -16)
        ])
    }
    
    // MARK: - Actions
    @objc private func voiceToggleButtonTapped() {
        isVoiceMode.toggle()
        voiceToggleButton.isSelected = isVoiceMode
        
        // Update UI based on mode
        if isVoiceMode {
            placeholderLabel.text = "Tap to speak..."
            textView.resignFirstResponder()
        } else {
            placeholderLabel.text = "Type a message..."
            textView.becomeFirstResponder()
        }
        
        // Animate button change
        UIView.animate(withDuration: 0.2) {
            self.voiceToggleButton.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
        } completion: { _ in
            UIView.animate(withDuration: 0.2) {
                self.voiceToggleButton.transform = .identity
            }
        }
        
        delegate?.inputBarDidToggleInputMode(isVoiceMode)
        updateSendButtonState()
    }
    
    @objc private func sendButtonTapped() {
        let text = textView.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        
        guard !text.isEmpty else { return }
        
        // Animate send button
        UIView.animate(withDuration: 0.1) {
            self.sendButton.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        } completion: { _ in
            UIView.animate(withDuration: 0.1) {
                self.sendButton.transform = .identity
            }
        }
        
        delegate?.inputBarDidSendMessage(text, isVoiceInput: isVoiceMode)
        clearText()
    }
    
    // MARK: - Helper Methods
    private func updateSendButtonState() {
        let hasText = !(textView.text?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
        let isEnabled = hasText || isVoiceMode
        
        sendButton.isEnabled = isEnabled
        sendButton.alpha = isEnabled ? 1.0 : 0.5
        
        // Update send button appearance
        if isEnabled {
            sendButton.tintColor = UIColor.systemBlue
        } else {
            sendButton.tintColor = UIColor.systemGray3
        }
    }
    
    private func updatePlaceholderVisibility() {
        placeholderLabel.isHidden = !textView.text.isEmpty
    }
    
    private func clearText() {
        textView.text = ""
        updatePlaceholderVisibility()
        updateSendButtonState()
        adjustTextViewHeight()
    }
    
    private func adjustTextViewHeight() {
        let size = textView.sizeThatFits(CGSize(width: textView.frame.width, height: CGFloat.greatestFiniteMagnitude))
        let newHeight = min(max(size.height, 36), textViewMaxHeight)
        
        textViewHeightConstraint.constant = newHeight
        textView.isScrollEnabled = size.height > textViewMaxHeight
        
        UIView.animate(withDuration: 0.2) {
            self.superview?.layoutIfNeeded()
        }
    }
}

// MARK: - UITextViewDelegate
extension FloatingInputBarView: UITextViewDelegate {
    func textViewDidChange(_ textView: UITextView) {
        updatePlaceholderVisibility()
        updateSendButtonState()
        adjustTextViewHeight()
    }
    
    func textViewDidBeginEditing(_ textView: UITextView) {
        // Ensure we're not in voice mode when text editing begins
        if isVoiceMode {
            isVoiceMode = false
            voiceToggleButton.isSelected = false
            placeholderLabel.text = "Type a message..."
            delegate?.inputBarDidToggleInputMode(false)
        }
    }
    
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        // Handle return key to send message
        if text == "\n" {
            sendButtonTapped()
            return false
        }
        return true
    }
}