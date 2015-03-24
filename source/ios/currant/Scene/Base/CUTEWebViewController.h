//
//  CUTEWebViewController.h
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CUTEWebViewController : UIViewController

@property (strong, nonatomic) NSString *urlPath;

- (void)loadURLPath:(NSString *)urlPath;

- (void)onPhoneButtonPressed:(id)sender;

@end
