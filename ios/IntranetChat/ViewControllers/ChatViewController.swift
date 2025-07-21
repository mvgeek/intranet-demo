import UIKit

class ChatViewController: UIViewController {
    
    // MARK: - UI Components
    private let tableView = UITableView()
    private let inputBarView = FloatingInputBarView()
    private let inputBarContainer = UIView()
    
    // MARK: - Properties
    private var messages: [ChatMessage] = []
    private var inputBarBottomConstraint: NSLayoutConstraint!
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupConstraints()
        setupKeyboardObservers()
        loadInitialMessages()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        view.backgroundColor = UIColor.systemBackground
        
        // Configure navigation
        title = "Team Chat"
        navigationController?.navigationBar.prefersLargeTitles = false
        
        // Setup table view
        setupTableView()
        
        // Setup input bar
        setupInputBar()
    }
    
    private func setupTableView() {
        tableView.delegate = self
        tableView.dataSource = self
        tableView.separatorStyle = .none
        tableView.backgroundColor = UIColor.systemBackground
        tableView.keyboardDismissMode = .onDrag
        tableView.contentInsetAdjustmentBehavior = .automatic
        
        // Register cell
        tableView.register(ChatMessageTableViewCell.self, forCellReuseIdentifier: ChatMessageTableViewCell.identifier)
        
        tableView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(tableView)
    }
    
    private func setupInputBar() {
        inputBarView.delegate = self
        
        // Container for input bar with background
        inputBarContainer.backgroundColor = UIColor.systemBackground
        inputBarContainer.translatesAutoresizingMaskIntoConstraints = false
        
        inputBarView.translatesAutoresizingMaskIntoConstraints = false
        inputBarContainer.addSubview(inputBarView)
        
        view.addSubview(inputBarContainer)
    }
    
    private func setupConstraints() {
        // Table view constraints
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: inputBarContainer.topAnchor)
        ])
        
        // Input bar container constraints
        inputBarBottomConstraint = inputBarContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        
        NSLayoutConstraint.activate([
            inputBarContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            inputBarContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            inputBarBottomConstraint,
            inputBarContainer.heightAnchor.constraint(greaterThanOrEqualToConstant: 60)
        ])
        
        // Input bar constraints within container
        NSLayoutConstraint.activate([
            inputBarView.topAnchor.constraint(equalTo: inputBarContainer.topAnchor, constant: 8),
            inputBarView.leadingAnchor.constraint(equalTo: inputBarContainer.leadingAnchor, constant: 16),
            inputBarView.trailingAnchor.constraint(equalTo: inputBarContainer.trailingAnchor, constant: -16),
            inputBarView.bottomAnchor.constraint(equalTo: inputBarContainer.bottomAnchor, constant: -8)
        ])
    }
    
    // MARK: - Keyboard Handling
    private func setupKeyboardObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow(_:)),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide(_:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }
    
    @objc private func keyboardWillShow(_ notification: Notification) {
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
              let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }
        
        let keyboardHeight = keyboardFrame.height - view.safeAreaInsets.bottom
        
        UIView.animate(withDuration: duration) {
            self.inputBarBottomConstraint.constant = -keyboardHeight
            self.view.layoutIfNeeded()
        }
        
        scrollToBottom(animated: true)
    }
    
    @objc private func keyboardWillHide(_ notification: Notification) {
        guard let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }
        
        UIView.animate(withDuration: duration) {
            self.inputBarBottomConstraint.constant = 0
            self.view.layoutIfNeeded()
        }
    }
    
    // MARK: - Data Management
    private func loadInitialMessages() {
        // Sample messages for demonstration
        messages = [
            ChatMessage(id: "1", text: "Welcome to the team chat!", isFromCurrentUser: false, timestamp: Date().addingTimeInterval(-3600), senderName: "John Doe"),
            ChatMessage(id: "2", text: "Thanks for the warm welcome!", isFromCurrentUser: true, timestamp: Date().addingTimeInterval(-3500), senderName: "You"),
            ChatMessage(id: "3", text: "Let's discuss the upcoming project milestones.", isFromCurrentUser: false, timestamp: Date().addingTimeInterval(-3400), senderName: "Jane Smith"),
            ChatMessage(id: "4", text: "Sounds good! I have some ideas to share.", isFromCurrentUser: true, timestamp: Date().addingTimeInterval(-3300), senderName: "You")
        ]
        
        DispatchQueue.main.async {
            self.tableView.reloadData()
            self.scrollToBottom(animated: false)
        }
    }
    
    private func addMessage(_ message: ChatMessage) {
        messages.append(message)
        
        DispatchQueue.main.async {
            let indexPath = IndexPath(row: self.messages.count - 1, section: 0)
            self.tableView.insertRows(at: [indexPath], with: .bottom)
            self.scrollToBottom(animated: true)
        }
    }
    
    private func scrollToBottom(animated: Bool) {
        guard !messages.isEmpty else { return }
        
        let lastIndexPath = IndexPath(row: messages.count - 1, section: 0)
        tableView.scrollToRow(at: lastIndexPath, at: .bottom, animated: animated)
    }
}

// MARK: - UITableViewDataSource
extension ChatViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return messages.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: ChatMessageTableViewCell.identifier, for: indexPath) as? ChatMessageTableViewCell else {
            return UITableViewCell()
        }
        
        let message = messages[indexPath.row]
        cell.configure(with: message)
        return cell
    }
}

// MARK: - UITableViewDelegate
extension ChatViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, estimatedHeightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return UITableView.automaticDimension
    }
}

// MARK: - FloatingInputBarDelegate
extension ChatViewController: FloatingInputBarDelegate {
    func inputBarDidSendMessage(_ text: String, isVoiceInput: Bool) {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let message = ChatMessage(
            id: UUID().uuidString,
            text: text,
            isFromCurrentUser: true,
            timestamp: Date(),
            senderName: "You",
            isVoiceMessage: isVoiceInput
        )
        
        addMessage(message)
        
        // Simulate response after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            let responses = [
                "That's a great point!",
                "I agree with that approach.",
                "Let me think about that.",
                "Good idea, let's implement that.",
                "Thanks for sharing!"
            ]
            
            let responseMessage = ChatMessage(
                id: UUID().uuidString,
                text: responses.randomElement() ?? "Thanks for your message!",
                isFromCurrentUser: false,
                timestamp: Date(),
                senderName: ["John Doe", "Jane Smith", "Mike Johnson"].randomElement() ?? "Team Member"
            )
            
            self.addMessage(responseMessage)
        }
    }
    
    func inputBarDidToggleInputMode(_ isVoiceMode: Bool) {
        // Handle voice/text mode toggle
        print("Input mode changed to: \(isVoiceMode ? "Voice" : "Text")")
    }
}