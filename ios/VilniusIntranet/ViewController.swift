import UIKit
import WebKit

class ViewController: UIViewController {
    
    @IBOutlet weak var webView: WKWebView!
    private var activityIndicator: UIActivityIndicatorView!
    
    // Configuration for the web app
    private let webAppURL = "http://localhost:3000" // Local development URL
    private let productionURL = "https://your-production-url.com" // Replace with your production URL
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupWebView()
        setupActivityIndicator()
        loadWebApp()
    }
    
    private func setupWebView() {
        webView.navigationDelegate = self
        webView.uiDelegate = self
        
        // Enable JavaScript and other web features
        let configuration = webView.configuration
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Add user scripts if needed for communication between web app and native app
        let userContentController = WKUserContentController()
        configuration.userContentController = userContentController
        
        // Configure web view settings
        webView.scrollView.bounces = true
        webView.allowsBackForwardNavigationGestures = true
        
        // Add refresh control
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(refreshWebView), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
    }
    
    private func setupActivityIndicator() {
        activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.center = view.center
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)
    }
    
    private func loadWebApp() {
        guard let url = URL(string: getCurrentURL()) else {
            showAlert(title: "Error", message: "Invalid URL configuration")
            return
        }
        
        let request = URLRequest(url: url)
        webView.load(request)
        activityIndicator.startAnimating()
    }
    
    private func getCurrentURL() -> String {
        #if DEBUG
        return webAppURL
        #else
        return productionURL
        #endif
    }
    
    @objc private func refreshWebView() {
        webView.reload()
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - WKNavigationDelegate
extension ViewController: WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        activityIndicator.startAnimating()
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
        
        let nsError = error as NSError
        if nsError.code == NSURLErrorNotConnectedToInternet {
            showAlert(title: "No Internet Connection", 
                     message: "Please check your internet connection and try again.")
        } else {
            showAlert(title: "Loading Error", 
                     message: "Failed to load the application. Please try again.")
        }
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Handle external links if needed
        if let url = navigationAction.request.url,
           !url.absoluteString.contains(getCurrentURL().replacingOccurrences(of: "http://", with: "").replacingOccurrences(of: "https://", with: "")) {
            // Open external links in Safari
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        } else {
            decisionHandler(.allow)
        }
    }
}

// MARK: - WKUIDelegate
extension ViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Handle popup windows
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
}