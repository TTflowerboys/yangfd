//
//  FXFormViewController+CUTEForm.m
//  currant
//
//  Created by Foster Yin on 4/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXFormViewController+CUTEForm.h"
#import "CUTEForm.h"
#import "SVProgressHUD+CUTEAPI.h"

@implementation FXFormViewController (CUTEForm)

- (BOOL)validateFormWithScenario:(NSString *)scenario {

    CUTEForm *form = (CUTEForm *)self.formController.form;
    NSError *error = [form validateFormWithScenario:scenario];
    if (error) {
        [SVProgressHUD showErrorWithError:error];
        return NO;
    }
    return YES;
}


@end
