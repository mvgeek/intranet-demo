import UIKit

struct UIConstants {
    
    // MARK: - Spacing
    struct Spacing {
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
        static let extraLarge: CGFloat = 32
    }
    
    // MARK: - Corner Radius
    struct CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let extraLarge: CGFloat = 20
        static let messageCell: CGFloat = 18
        static let inputBar: CGFloat = 22
    }
    
    // MARK: - Animation Duration
    struct Animation {
        static let fast: TimeInterval = 0.2
        static let normal: TimeInterval = 0.3
        static let slow: TimeInterval = 0.5
    }
    
    // MARK: - Typography
    struct Typography {
        static let messageText = UIFont.systemFont(ofSize: 16)
        static let messageTextBold = UIFont.boldSystemFont(ofSize: 16)
        static let senderName = UIFont.boldSystemFont(ofSize: 12)
        static let timestamp = UIFont.systemFont(ofSize: 11)
        static let inputText = UIFont.systemFont(ofSize: 16)
        static let navigationTitle = UIFont.boldSystemFont(ofSize: 17)
    }
    
    // MARK: - Dimensions
    struct Dimensions {
        static let inputBarMinHeight: CGFloat = 44
        static let inputBarMaxTextHeight: CGFloat = 100
        static let buttonSize: CGFloat = 40
        static let cellMinHeight: CGFloat = 80
        static let messageCellMaxWidth: CGFloat = 0.75 // 75% of screen width
    }
    
    // MARK: - Colors
    struct Colors {
        // Message colors
        static let userMessageBackground = UIColor.systemBlue
        static let otherMessageBackground = UIColor.systemGray5
        static let userMessageText = UIColor.white
        static let otherMessageText = UIColor.label
        
        // Input bar colors
        static let inputBarBackground = UIColor.systemBackground
        static let inputBarBorder = UIColor.separator
        static let textViewBackground = UIColor.systemGray6
        static let placeholderText = UIColor.placeholderText
        
        // Button colors
        static let activeButton = UIColor.systemBlue
        static let inactiveButton = UIColor.systemGray3
        static let voiceToggleBackground = UIColor.systemGray6
        
        // Shadow colors
        static let shadowColor = UIColor.black.withAlphaComponent(0.1)
    }
    
    // MARK: - Shadow Properties
    struct Shadow {
        static let offset = CGSize(width: 0, height: 2)
        static let opacity: Float = 0.1
        static let radius: CGFloat = 8
        static let messageRadius: CGFloat = 2
    }
}

// MARK: - UIView Extensions for Styling
extension UIView {
    
    func addShadow(
        color: UIColor = UIConstants.Colors.shadowColor,
        offset: CGSize = UIConstants.Shadow.offset,
        opacity: Float = UIConstants.Shadow.opacity,
        radius: CGFloat = UIConstants.Shadow.radius
    ) {
        layer.shadowColor = color.cgColor
        layer.shadowOffset = offset
        layer.shadowOpacity = opacity
        layer.shadowRadius = radius
        layer.masksToBounds = false
    }
    
    func addBorder(
        width: CGFloat = 1,
        color: UIColor = UIConstants.Colors.inputBarBorder
    ) {
        layer.borderWidth = width
        layer.borderColor = color.cgColor
    }
    
    func setCornerRadius(_ radius: CGFloat) {
        layer.cornerRadius = radius
        layer.masksToBounds = true
    }
}

// MARK: - Animation Helpers
extension UIView {
    
    static func animateWithSpring(
        duration: TimeInterval = UIConstants.Animation.normal,
        animations: @escaping () -> Void,
        completion: ((Bool) -> Void)? = nil
    ) {
        UIView.animate(
            withDuration: duration,
            delay: 0,
            usingSpringWithDamping: 0.8,
            initialSpringVelocity: 0.5,
            options: [.curveEaseInOut, .allowUserInteraction],
            animations: animations,
            completion: completion
        )
    }
    
    func bounceAnimation() {
        UIView.animate(withDuration: 0.1) {
            self.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        } completion: { _ in
            UIView.animate(withDuration: 0.1) {
                self.transform = .identity
            }
        }
    }
    
    func pulseAnimation() {
        UIView.animate(withDuration: 0.2) {
            self.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
        } completion: { _ in
            UIView.animate(withDuration: 0.2) {
                self.transform = .identity
            }
        }
    }
}