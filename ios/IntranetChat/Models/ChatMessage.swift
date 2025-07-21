import Foundation

struct ChatMessage {
    let id: String
    let text: String
    let isFromCurrentUser: Bool
    let timestamp: Date
    let senderName: String
    let isVoiceMessage: Bool
    
    init(id: String, text: String, isFromCurrentUser: Bool, timestamp: Date, senderName: String, isVoiceMessage: Bool = false) {
        self.id = id
        self.text = text
        self.isFromCurrentUser = isFromCurrentUser
        self.timestamp = timestamp
        self.senderName = senderName
        self.isVoiceMessage = isVoiceMessage
    }
}

// MARK: - Equatable
extension ChatMessage: Equatable {
    static func == (lhs: ChatMessage, rhs: ChatMessage) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Hashable
extension ChatMessage: Hashable {
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}