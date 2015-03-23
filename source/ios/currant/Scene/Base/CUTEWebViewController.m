//
//  CUTEWebViewController.m
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebViewController.h"

@interface CUTEWebViewController () <UIWebViewDelegate>
{
    NSURL *hostURL;
    UIWebView *webView;
}

@end

@implementation CUTEWebViewController

- (id) init {
    self = [super init];
    if (self) {
      hostURL = [NSURL URLWithString:@"http://localhost:8181"];
    }
    return self;
}

- (void)loadURLPath:(NSString *)urlPath {
    if (!webView) {
        webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 20, CGRectGetWidth(self.view.bounds), CGRectGetHeight(self.view.bounds) - 20)];
        [self.view addSubview:webView];
        webView.delegate = self;
    }
    
    
    NSURLRequest *urlRequest = [[NSURLRequest alloc] initWithURL:[NSURL URLWithString:urlPath relativeToURL:hostURL]];
    [webView loadRequest:urlRequest];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleLightContent;
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
    NSError *error = nil;
    NSString *css = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"base" ofType:@"css"] encoding: NSUTF8StringEncoding error: &error];
    css = @"\".hiddenInClient {display:none;}\"";
    NSString* js = [NSString stringWithFormat:
                    @"var styleNode = document.createElement('style');\n"
                    "styleNode.type = \"text/css\";\n"
                    "var styleText = document.createTextNode(%@);\n"
                    "styleNode.appendChild(styleText);\n"
                    "document.getElementsByTagName('head')[0].appendChild(styleNode);\n",css];
    [webView stringByEvaluatingJavaScriptFromString:js];
}

- (void)webViewDidFinishLoad:(UIWebView *)theWebView
{
    
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
