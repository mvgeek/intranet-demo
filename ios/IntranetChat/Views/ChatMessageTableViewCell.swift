import UIKit

class ChatMessageTableViewCell: UITableViewCell {
    
    static let identifier = "ChatMessageTableViewCell"
    
    // MARK: - UI Components
    private let messageContainerView = UIView()
    private let messageLabel = UILabel()
    private let senderLabel = UILabel()
    private let timestampLabel = UILabel()
    private let voiceIndicatorImageView = UIImageView()
    
    // MARK: - Properties
    private var leadingConstraint: NSLayoutConstraint!
    private var trailingConstraint: NSLayoutConstraint!
    
    // MARK: - Initialization
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
        setupConstraints()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
        messageLabel.text = nil
        senderLabel.text = nil
        timestampLabel.text = nil
        voiceIndicatorImageView.isHidden = true
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        backgroundColor = UIColor.clear
        selectionStyle = .none
        contentView.backgroundColor = UIColor.clear
        
        setupMessageContainer()
        setupLabels()
        setupVoiceIndicator()
    }
    
    private func setupMessageContainer() {
        messageContainerView.translatesAutoresizingMaskIntoConstraints = false
        messageContainerView.layer.cornerRadius = 18
        messageContainerView.layer.masksToBounds = true
        contentView.addSubview(messageContainerView)
    }
    
    private func setupLabels() {
        // Message label
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        messageLabel.font = UIFont.systemFont(ofSize: 16)
        messageLabel.numberOfLines = 0
        messageLabel.lineBreakMode = .byWordWrapping
        messageContainerView.addSubview(messageLabel)
        
        // Sender label
        senderLabel.translatesAutoresizingMaskIntoConstraints = false
        senderLabel.font = UIFont.boldSystemFont(ofSize: 12)
        senderLabel.textColor = UIColor.secondaryLabel
        contentView.addSubview(senderLabel)
        
        // Timestamp label
        timestampLabel.translatesAutoresizingMaskIntoConstraints = false
        timestampLabel.font = UIFont.systemFont(ofSize: 11)
        timestampLabel.textColor = UIColor.tertiaryLabel
        contentView.addSubview(timestampLabel)
    }
    
    private func setupVoiceIndicator() {
        voiceIndicatorImageView.translatesAutoresizingMaskIntoConstraints = false
        voiceIndicatorImageView.image = UIImage(systemName: "mic.fill")
        voiceIndicatorImageView.contentMode = .scaleAspectFit
        voiceIndicatorImageView.tintColor = UIColor.systemBlue
        voiceIndicatorImageView.isHidden = true
        messageContainerView.addSubview(voiceIndicatorImageView)
    }
    
    private func setupConstraints() {
        // Leading and trailing constraints (will be modified based on message type)
        leadingConstraint = messageContainerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16)
        trailingConstraint = messageContainerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16)
        
        NSLayoutConstraint.activate([
            // Message container
            messageContainerView.topAnchor.constraint(equalTo: senderLabel.bottomAnchor, constant: 4),
            messageContainerView.widthAnchor.constraint(lessThanOrEqualTo: contentView.widthAnchor, multiplier: 0.75),
            
            // Message label constraints
            messageLabel.topAnchor.constraint(equalTo: messageContainerView.topAnchor, constant: 12),
            messageLabel.leadingAnchor.constraint(equalTo: messageContainerView.leadingAnchor, constant: 16),
            messageLabel.trailingAnchor.constraint(equalTo: messageContainerView.trailingAnchor, constant: -16),
            messageLabel.bottomAnchor.constraint(equalTo: messageContainerView.bottomAnchor, constant: -12),
            
            // Voice indicator constraints
            voiceIndicatorImageView.leadingAnchor.constraint(equalTo: messageContainerView.leadingAnchor, constant: 12),
            voiceIndicatorImageView.bottomAnchor.constraint(equalTo: messageContainerView.bottomAnchor, constant: -8),
            voiceIndicatorImageView.widthAnchor.constraint(equalToConstant: 16),
            voiceIndicatorImageView.heightAnchor.constraint(equalToConstant: 16),
            
            // Sender label
            senderLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 8),
            senderLabel.leadingAnchor.constraint(equalTo: messageContainerView.leadingAnchor, constant: 4),
            
            // Timestamp label
            timestampLabel.topAnchor.constraint(equalTo: messageContainerView.bottomAnchor, constant: 4),
            timestampLabel.leadingAnchor.constraint(equalTo: messageContainerView.leadingAnchor, constant: 4),
            timestampLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8)
        ])
    }
    
    // MARK: - Configuration
    func configure(with message: ChatMessage) {
        messageLabel.text = message.text
        senderLabel.text = message.senderName
        timestampLabel.text = formatTimestamp(message.timestamp)
        voiceIndicatorImageView.isHidden = !message.isVoiceMessage
        
        updateAppearance(for: message)
    }
    
    private func updateAppearance(for message: ChatMessage) {
        // Remove previous constraints
        leadingConstraint.isActive = false
        trailingConstraint.isActive = false
        
        if message.isFromCurrentUser {
            // User's message (right aligned, blue)
            leadingConstraint = messageContainerView.leadingAnchor.constraint(greaterThanOrEqualTo: contentView.leadingAnchor, constant: 64)
            trailingConstraint = messageContainerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16)
            
            messageContainerView.backgroundColor = UIColor.systemBlue
            messageLabel.textColor = UIColor.white
            
            // Align sender and timestamp labels to the right
            senderLabel.textAlignment = .right
            timestampLabel.textAlignment = .right
            
            // Update sender and timestamp constraints for right alignment
            senderLabel.trailingAnchor.constraint(equalTo: messageContainerView.trailingAnchor, constant: -4).isActive = true
            timestampLabel.trailingAnchor.constraint(equalTo: messageContainerView.trailingAnchor, constant: -4).isActive = true
            
        } else {
            // Other user's message (left aligned, gray)
            leadingConstraint = messageContainerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16)
            trailingConstraint = messageContainerView.trailingAnchor.constraint(lessThanOrEqualTo: contentView.trailingAnchor, constant: -64)
            
            messageContainerView.backgroundColor = UIColor.systemGray5
            messageLabel.textColor = UIColor.label
            
            // Align sender and timestamp labels to the left
            senderLabel.textAlignment = .left
            timestampLabel.textAlignment = .left
        }
        
        // Activate the new constraints
        leadingConstraint.isActive = true
        trailingConstraint.isActive = true
        
        // Add subtle shadow for depth
        messageContainerView.layer.shadowColor = UIColor.black.cgColor
        messageContainerView.layer.shadowOffset = CGSize(width: 0, height: 1)
        messageContainerView.layer.shadowOpacity = 0.1
        messageContainerView.layer.shadowRadius = 2
    }
    
    private func formatTimestamp(_ date: Date) -> String {
        let formatter = DateFormatter()
        
        if Calendar.current.isDateInToday(date) {
            formatter.timeStyle = .short
        } else if Calendar.current.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            formatter.dateStyle = .short
            formatter.timeStyle = .none
        }
        
        return formatter.string(from: date)
    }
}