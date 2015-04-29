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
#import "FXFormViewController+CUTEForm.h"
#import "CUTERentTickePublisher.h"

@implementation CUTERentAreaViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
    self.navigationItem.title = STR(@"面积");
}

- (void)optionBack {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)onSaveButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"save"]) {
        return;
    }
    [self.navigationController popViewControllerAnimated:YES];
    CUTEAreaForm *form = (CUTEAreaForm *)self.formController.form;
    CUTETicket *ticket = self.ticket;
    ticket.space = [CUTEArea areaWithValue:form.area unit:form.unit];
    if (ticket.rentType.slug && [ticket.rentType.slug hasSuffix:@":whole"]) {
        ticket.property.space = ticket.space;
    }
    else {
        ticket.property.space = nil;
    }

    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    [[CUTERentTickePublisher sharedInstance] editTicket:self.ticket];
}

@end
