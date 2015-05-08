//
//  SVProgressHUD+CUTEAPI.h
//  currant
//
//  Created by Foster Yin on 4/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <SVProgressHUD.h>

@interface SVProgressHUD (CUTEAPI)

+ (void)showErrorWithError:(NSError *)error;

+ (void)showErrorWithException:(NSException *)exception;

@end
