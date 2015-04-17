//
//  CUTERentAreaViewController.m
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAreaViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEAreaForm.h"
#import "CUTEDataManager.h"
#import "CUTEAreaForm.h"
#import "SVProgressHUD+CUTEAPI.h"

@implementation CUTERentAreaViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
    self.navigationItem.title = STR(@"面积");
}

- (BOOL)validate {
    CUTEAreaForm *form = (CUTEAreaForm *)self.formController.form;
    if (form.area <= FLT_EPSILON) {
        [SVProgressHUD showErrorWithStatus:STR(@"面积必须大于0")];
        return NO;
    }
    return YES;
}

- (void)onSaveButtonPressed:(id)sender {
    if (![self validate]) {
        return;
    }
    [self.navigationController popViewControllerAnimated:YES];
    CUTEAreaForm *form = (CUTEAreaForm *)self.formController.form;
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    ticket.space = [CUTEArea areaWithValue:form.area unit:form.unit];
    ticket.property.space = ticket.space;
}

@end
