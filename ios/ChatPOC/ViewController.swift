//
//  ViewController.swift
//  ChatPOC
//
//  Created by iOS Project Structure Agent on 2025-07-21.
//

import UIKit
import Speech
import AVFoundation

class ViewController: UIViewController {
    
    // MARK: - Properties
    
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    // MARK: - UI Elements
    
    private lazy var chatTableView: UITableView = {
        let tableView = UITableView()
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.backgroundColor = UIColor.systemBackground
        tableView.separatorStyle = .none
        tableView.keyboardDismissMode = .onDrag
        return tableView
    }()
    
    private lazy var messageInputContainer: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = UIColor.systemBackground
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOffset = CGSize(width: 0, height: -1)
        view.layer.shadowOpacity = 0.1
        view.layer.shadowRadius = 1
        return view
    }()
    
    private lazy var messageTextField: UITextField = {
        let textField = UITextField()
        textField.translatesAutoresizingMaskIntoConstraints = false
        textField.placeholder = "Type your message..."
        textField.borderStyle = .roundedRect
        textField.backgroundColor = UIColor.systemGray6
        textField.delegate = self
        return textField
    }()
    
    private lazy var speechButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setImage(UIImage(systemName: "mic"), for: .normal)
        button.setImage(UIImage(systemName: "mic.fill"), for: .selected)
        button.tintColor = UIColor.systemBlue
        button.backgroundColor = UIColor.systemGray6
        button.layer.cornerRadius = 25
        button.addTarget(self, action: #selector(speechButtonTapped), for: .touchUpInside)
        return button
    }()
    
    private lazy var sendButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Send", for: .normal)
        button.setTitleColor(UIColor.white, for: .normal)
        button.backgroundColor = UIColor.systemBlue
        button.layer.cornerRadius = 20
        button.addTarget(self, action: #selector(sendButtonTapped), for: .touchUpInside)
        return button
    }()
    
    // MARK: - Data
    
    private var messages: [ChatMessage] = []
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupSpeechRecognition()
        
        // Add some sample messages for demonstration
        addSampleMessages()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        requestSpeechRecognitionPermission()
    }
    
    // MARK: - Setup Methods
    
    private func setupUI() {
        title = "Chat POC"
        view.backgroundColor = UIColor.systemBackground
        
        // Add subviews
        view.addSubview(chatTableView)
        view.addSubview(messageInputContainer)
        messageInputContainer.addSubview(messageTextField)
        messageInputContainer.addSubview(speechButton)
        messageInputContainer.addSubview(sendButton)
        
        // Setup constraints
        setupConstraints()
        
        // Register table view cells
        chatTableView.register(ChatMessageCell.self, forCellReuseIdentifier: "ChatMessageCell")
        
        // Setup keyboard notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Chat table view
            chatTableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            chatTableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            chatTableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            chatTableView.bottomAnchor.constraint(equalTo: messageInputContainer.topAnchor),
            
            // Message input container
            messageInputContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            messageInputContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            messageInputContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            messageInputContainer.heightAnchor.constraint(equalToConstant: 70),
            
            // Message text field
            messageTextField.leadingAnchor.constraint(equalTo: messageInputContainer.leadingAnchor, constant: 16),
            messageTextField.centerYAnchor.constraint(equalTo: messageInputContainer.centerYAnchor),
            messageTextField.heightAnchor.constraint(equalToConstant: 40),
            
            // Speech button
            speechButton.leadingAnchor.constraint(equalTo: messageTextField.trailingAnchor, constant: 8),
            speechButton.centerYAnchor.constraint(equalTo: messageInputContainer.centerYAnchor),
            speechButton.widthAnchor.constraint(equalToConstant: 50),
            speechButton.heightAnchor.constraint(equalToConstant: 50),
            
            // Send button
            sendButton.leadingAnchor.constraint(equalTo: speechButton.trailingAnchor, constant: 8),
            sendButton.trailingAnchor.constraint(equalTo: messageInputContainer.trailingAnchor, constant: -16),
            sendButton.centerYAnchor.constraint(equalTo: messageInputContainer.centerYAnchor),
            sendButton.widthAnchor.constraint(equalToConstant: 60),
            sendButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }
    
    private func setupSpeechRecognition() {
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        speechRecognizer?.delegate = self
    }
    
    // MARK: - Speech Recognition Methods
    
    private func requestSpeechRecognitionPermission() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    self?.speechButton.isEnabled = true
                case .denied, .restricted, .notDetermined:
                    self?.speechButton.isEnabled = false
                    print("Speech recognition not authorized")
                @unknown default:
                    self?.speechButton.isEnabled = false
                }
            }
        }
    }
    
    // MARK: - Action Methods
    
    @objc private func speechButtonTapped() {
        if audioEngine.isRunning {
            stopSpeechRecognition()
        } else {
            startSpeechRecognition()
        }
    }
    
    @objc private func sendButtonTapped() {
        sendMessage()
    }
    
    @objc private func keyboardWillShow(notification: NSNotification) {
        // Handle keyboard appearance
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
        let keyboardHeight = keyboardFrame.height
        
        UIView.animate(withDuration: 0.3) {
            self.view.frame.origin.y = -keyboardHeight + self.view.safeAreaInsets.bottom
        }
    }
    
    @objc private func keyboardWillHide(notification: NSNotification) {
        UIView.animate(withDuration: 0.3) {
            self.view.frame.origin.y = 0
        }
    }
    
    // MARK: - Helper Methods
    
    private func startSpeechRecognition() {
        // TODO: Implement speech recognition start logic
        speechButton.isSelected = true
        print("Starting speech recognition...")
    }
    
    private func stopSpeechRecognition() {
        // TODO: Implement speech recognition stop logic
        speechButton.isSelected = false
        print("Stopping speech recognition...")
    }
    
    private func sendMessage() {
        guard let text = messageTextField.text, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }
        
        let message = ChatMessage(id: UUID().uuidString, text: text, isFromUser: true, timestamp: Date())
        messages.append(message)
        
        messageTextField.text = ""
        
        // Reload table view and scroll to bottom
        chatTableView.reloadData()
        scrollToBottom()
        
        // Simulate response (for POC purposes)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.simulateResponse(to: text)
        }
    }
    
    private func simulateResponse(to userMessage: String) {
        let responses = [
            "I understand you said: \"\(userMessage)\"",
            "That's interesting! Tell me more.",
            "Thanks for sharing that with me.",
            "I'm here to help with your questions.",
            "Could you elaborate on that?"
        ]
        
        let randomResponse = responses.randomElement() ?? "I received your message."
        let responseMessage = ChatMessage(id: UUID().uuidString, text: randomResponse, isFromUser: false, timestamp: Date())
        
        messages.append(responseMessage)
        chatTableView.reloadData()
        scrollToBottom()
    }
    
    private func scrollToBottom() {
        guard !messages.isEmpty else { return }
        let indexPath = IndexPath(row: messages.count - 1, section: 0)
        chatTableView.scrollToRow(at: indexPath, at: .bottom, animated: true)
    }
    
    private func addSampleMessages() {
        let sampleMessages = [
            ChatMessage(id: "1", text: "Welcome to Chat POC!", isFromUser: false, timestamp: Date().addingTimeInterval(-300)),
            ChatMessage(id: "2", text: "This app demonstrates speech-to-text functionality.", isFromUser: false, timestamp: Date().addingTimeInterval(-240)),
            ChatMessage(id: "3", text: "Try tapping the microphone button to use voice input.", isFromUser: false, timestamp: Date().addingTimeInterval(-180))
        ]
        
        messages.append(contentsOf: sampleMessages)
        chatTableView.reloadData()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - UITableViewDataSource

extension ViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return messages.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ChatMessageCell", for: indexPath) as! ChatMessageCell
        cell.configure(with: messages[indexPath.row])
        return cell
    }
}

// MARK: - UITableViewDelegate

extension ViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return UITableView.automaticDimension
    }
    
    func tableView(_ tableView: UITableView, estimatedHeightForRowAt indexPath: IndexPath) -> CGFloat {
        return 60
    }
}

// MARK: - UITextFieldDelegate

extension ViewController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        sendMessage()
        return true
    }
}

// MARK: - SFSpeechRecognizerDelegate

extension ViewController: SFSpeechRecognizerDelegate {
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        speechButton.isEnabled = available
    }
}

// MARK: - Supporting Types

struct ChatMessage {
    let id: String
    let text: String
    let isFromUser: Bool
    let timestamp: Date
}

class ChatMessageCell: UITableViewCell {
    
    private let messageLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 16)
        return label
    }()
    
    private let messageContainer: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.layer.cornerRadius = 12
        return view
    }()
    
    private let timestampLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 12)
        label.textColor = UIColor.systemGray
        return label
    }()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupCell()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupCell() {
        selectionStyle = .none
        backgroundColor = UIColor.clear
        
        contentView.addSubview(messageContainer)
        messageContainer.addSubview(messageLabel)
        contentView.addSubview(timestampLabel)
        
        NSLayoutConstraint.activate([
            messageContainer.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 4),
            messageContainer.bottomAnchor.constraint(equalTo: timestampLabel.topAnchor, constant: -4),
            
            messageLabel.topAnchor.constraint(equalTo: messageContainer.topAnchor, constant: 8),
            messageLabel.bottomAnchor.constraint(equalTo: messageContainer.bottomAnchor, constant: -8),
            messageLabel.leadingAnchor.constraint(equalTo: messageContainer.leadingAnchor, constant: 12),
            messageLabel.trailingAnchor.constraint(equalTo: messageContainer.trailingAnchor, constant: -12),
            
            timestampLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8)
        ])
    }
    
    func configure(with message: ChatMessage) {
        messageLabel.text = message.text
        
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        timestampLabel.text = formatter.string(from: message.timestamp)
        
        if message.isFromUser {
            // User message - align right, blue background
            messageContainer.backgroundColor = UIColor.systemBlue
            messageLabel.textColor = UIColor.white
            
            NSLayoutConstraint.activate([
                messageContainer.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
                messageContainer.leadingAnchor.constraint(greaterThanOrEqualTo: contentView.leadingAnchor, constant: 60),
                timestampLabel.trailingAnchor.constraint(equalTo: messageContainer.trailingAnchor)
            ])
        } else {
            // System/Bot message - align left, gray background
            messageContainer.backgroundColor = UIColor.systemGray5
            messageLabel.textColor = UIColor.label
            
            NSLayoutConstraint.activate([
                messageContainer.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
                messageContainer.trailingAnchor.constraint(lessThanOrEqualTo: contentView.trailingAnchor, constant: -60),
                timestampLabel.leadingAnchor.constraint(equalTo: messageContainer.leadingAnchor)
            ])
        }
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
        messageContainer.removeFromSuperview()
        setupCell()
    }
}